import time
import numpy as np


def is_diagonally_dominant(A):
    A = np.array(A, dtype=float)
    for i in range(A.shape[0]):
        row_sum = np.sum(np.abs(A[i])) - abs(A[i, i])
        if abs(A[i, i]) < row_sum:
            return False
    return True


def gaussian_elimination(A, b):
    start = time.perf_counter()
    method = "Gaussian Elimination"
    notes = "Direct method: good for small and medium systems, and it does not need convergence iterations."

    try:
        A = np.array(A, dtype=float)
        b = np.array(b, dtype=float)
        n = len(b)
        aug = np.column_stack((A.copy(), b.copy()))
    except Exception as exc:
        return failure_result(method, start, f"Invalid matrix or vector: {exc}", notes)

    try:
        for i in range(n):
            pivot_row = i + np.argmax(np.abs(aug[i:, i]))
            if abs(aug[pivot_row, i]) < 1e-12:
                return failure_result(method, start, "Zero pivot found; the matrix may be singular.", notes)
            if pivot_row != i:
                aug[[i, pivot_row]] = aug[[pivot_row, i]]

            for j in range(i + 1, n):
                factor = aug[j, i] / aug[i, i]
                aug[j, i:] = aug[j, i:] - factor * aug[i, i:]

        x = np.zeros(n)
        for i in range(n - 1, -1, -1):
            if abs(aug[i, i]) < 1e-12:
                return failure_result(method, start, "Zero pivot found during back substitution.", notes)
            x[i] = (aug[i, -1] - np.dot(aug[i, i + 1:n], x[i + 1:n])) / aug[i, i]

        residual = vector_norm(A @ x - b)
        return make_result(method, x, residual, residual, n, (time.perf_counter() - start) * 1000, True, None, [], notes)
    except Exception as exc:
        return failure_result(method, start, str(exc), notes)


def jacobi(A, b, tol, max_iter):
    start = time.perf_counter()
    method = "Jacobi"
    notes = "Simple iterative method; often slower and more sensitive to matrix properties."
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)
    n = len(b)

    if np.any(np.abs(np.diag(A)) < 1e-12):
        return failure_result(method, start, "Diagonal entry is zero.", notes)
    if not is_diagonally_dominant(A):
        notes += " The matrix is not diagonally dominant, so convergence is not guaranteed."

    x = np.zeros(n)
    history = []

    for k in range(1, int(max_iter) + 1):
        next_x = np.zeros(n)
        for i in range(n):
            total = np.dot(A[i, :], x) - A[i, i] * x[i]
            next_x[i] = (b[i] - total) / A[i, i]

        residual = vector_norm(A @ next_x - b)
        history.append({"k": k, "residual": clean_number(residual), "error": clean_number(residual)})

        if residual < tol:
            return make_result(method, next_x, residual, residual, k, (time.perf_counter() - start) * 1000, True, None, history, notes)
        if vector_norm(next_x) > 1e12:
            return failure_result(method, start, "Iteration appears to be diverging.", notes)
        x = next_x

    residual = vector_norm(A @ x - b)
    return make_result(method, x, residual, residual, int(max_iter), (time.perf_counter() - start) * 1000, False, "Maximum iterations reached.", history, notes)


def gauss_seidel(A, b, tol, max_iter):
    start = time.perf_counter()
    method = "Gauss-Seidel"
    notes = "Often converges faster than Jacobi, but it still depends on the matrix."
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)
    n = len(b)

    if np.any(np.abs(np.diag(A)) < 1e-12):
        return failure_result(method, start, "Diagonal entry is zero.", notes)
    if not is_diagonally_dominant(A):
        notes += " The matrix is not diagonally dominant, so convergence is not guaranteed."

    x = np.zeros(n)
    history = []

    for k in range(1, int(max_iter) + 1):
        old_x = x.copy()
        for i in range(n):
            lower_sum = np.dot(A[i, :i], x[:i])
            upper_sum = np.dot(A[i, i + 1:], old_x[i + 1:])
            x[i] = (b[i] - lower_sum - upper_sum) / A[i, i]

        residual = vector_norm(A @ x - b)
        history.append({"k": k, "residual": clean_number(residual), "error": clean_number(residual)})

        if residual < tol:
            return make_result(method, x, residual, residual, k, (time.perf_counter() - start) * 1000, True, None, history, notes)
        if vector_norm(x) > 1e12:
            return failure_result(method, start, "Iteration appears to be diverging.", notes)

    residual = vector_norm(A @ x - b)
    return make_result(method, x, residual, residual, int(max_iter), (time.perf_counter() - start) * 1000, False, "Maximum iterations reached.", history, notes)


def run_linear_systems(args):
    A = args.get("A")
    b = args.get("b")
    tol = float(args.get("tol", 1e-6))
    max_iter = int(args.get("max_iter", 100))
    methods = set(args.get("methods", []))

    results = []
    if "gaussian" in methods:
        results.append(gaussian_elimination(A, b))
    if "jacobi" in methods:
        results.append(jacobi(A, b, tol, max_iter))
    if "gauss_seidel" in methods:
        results.append(gauss_seidel(A, b, tol, max_iter))
    return {"results": results}
