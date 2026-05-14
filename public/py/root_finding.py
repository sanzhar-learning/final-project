import time
import math


def bisection(f, a, b, tol, max_iter):
    start = time.perf_counter()
    method = "Bisection"
    notes = "Very reliable when f(a) and f(b) have opposite signs, but usually needs more iterations."

    try:
        a = float(a)
        b = float(b)
        fa = float(f(a))
        fb = float(f(b))
    except Exception as exc:
        return failure_result(method, start, f"Could not evaluate f(x): {exc}", notes)

    if fa == 0:
        return make_result(method, a, abs(fa), None, 0, (time.perf_counter() - start) * 1000, True, None, [], notes)
    if fb == 0:
        return make_result(method, b, abs(fb), None, 0, (time.perf_counter() - start) * 1000, True, None, [], notes)
    if fa * fb > 0:
        return failure_result(method, start, "f(a) and f(b) must have opposite signs.", notes)

    history = []
    root = None
    error = None

    for k in range(1, int(max_iter) + 1):
        c = (a + b) / 2
        fc = float(f(c))
        error = abs(fc)
        history.append({"k": k, "x": clean_number(c), "fx": clean_number(fc), "error": clean_number(error)})

        if error < tol or abs(b - a) / 2 < tol:
            root = c
            return make_result(method, root, error, None, k, (time.perf_counter() - start) * 1000, True, None, history, notes)

        if fa * fc < 0:
            b = c
            fb = fc
        else:
            a = c
            fa = fc

    root = (a + b) / 2
    return make_result(method, root, error, None, int(max_iter), (time.perf_counter() - start) * 1000, False, "Maximum iterations reached.", history, notes)


def derivative(f, x):
    h = 1e-6
    return (float(f(x + h)) - float(f(x - h))) / (2 * h)


def newton(f, x0, tol, max_iter):
    start = time.perf_counter()
    method = "Newton"
    notes = "Usually fast near the root, but it depends on a good starting point and a nonzero derivative."
    x = float(x0)
    history = []

    for k in range(1, int(max_iter) + 1):
        try:
            fx = float(f(x))
            dfx = derivative(f, x)
        except Exception as exc:
            return failure_result(method, start, f"Could not evaluate f(x) or derivative: {exc}", notes)

        if not math.isfinite(fx) or not math.isfinite(dfx):
            return failure_result(method, start, "Function or derivative became non-finite.", notes)
        if abs(dfx) < 1e-12:
            return failure_result(method, start, "Derivative is too close to zero.", notes)

        next_x = x - fx / dfx
        step_error = abs(next_x - x)
        next_fx = float(f(next_x))
        history.append({
            "k": k,
            "x": clean_number(next_x),
            "fx": clean_number(next_fx),
            "error": clean_number(abs(next_fx)),
        })

        if abs(next_fx) < tol or step_error < tol:
            return make_result(method, next_x, abs(next_fx), None, k, (time.perf_counter() - start) * 1000, True, None, history, notes)

        if abs(next_x) > 1e12:
            return failure_result(method, start, "Iteration appears to be diverging.", notes)
        x = next_x

    final_fx = abs(float(f(x)))
    return make_result(method, x, final_fx, None, int(max_iter), (time.perf_counter() - start) * 1000, False, "Maximum iterations reached.", history, notes)


def fixed_point(f, g, x0, tol, max_iter):
    start = time.perf_counter()
    method = "Fixed Point"
    notes = "Useful when a good x = g(x) transformation is available; otherwise it may fail to converge."
    x = float(x0)
    history = []

    for k in range(1, int(max_iter) + 1):
        try:
            next_x = float(g(x))
            fx = float(f(next_x))
        except Exception as exc:
            return failure_result(method, start, f"Could not evaluate g(x) or f(x): {exc}", notes)

        error = abs(next_x - x)
        history.append({"k": k, "x": clean_number(next_x), "fx": clean_number(fx), "error": clean_number(error)})

        if not math.isfinite(next_x) or abs(next_x) > 1e12:
            return failure_result(method, start, "Iteration appears to be diverging.", notes)
        if error < tol:
            return make_result(method, next_x, abs(fx), None, k, (time.perf_counter() - start) * 1000, True, None, history, notes)
        x = next_x

    final_fx = abs(float(f(x)))
    return make_result(method, x, final_fx, None, int(max_iter), (time.perf_counter() - start) * 1000, False, "Maximum iterations reached.", history, notes)


def run_root_finding(args):
    f = make_function(args.get("function_expr", "x**2 - 3"))
    g_expr = args.get("g_expr") or ""
    g = make_function(g_expr) if g_expr.strip() else None
    a = float(args.get("a", 1))
    b = float(args.get("b", 2))
    x0 = float(args.get("x0", 1.5))
    tol = float(args.get("tol", 1e-6))
    max_iter = int(args.get("max_iter", 50))
    methods = set(args.get("methods", []))

    results = []
    if "bisection" in methods:
        results.append(bisection(f, a, b, tol, max_iter))
    if "newton" in methods:
        results.append(newton(f, x0, tol, max_iter))
    if "fixed_point" in methods:
        if g is None:
            start = time.perf_counter()
            results.append(failure_result("Fixed Point", start, "Enter g(x) to run fixed-point iteration."))
        else:
            results.append(fixed_point(f, g, x0, tol, max_iter))

    return {
        "results": results,
        "function_points": sample_function(f, a, b),
    }
