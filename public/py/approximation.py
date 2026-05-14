import time
import numpy as np


def polynomial_values(coefficients, xs):
    return np.polyval(np.array(coefficients, dtype=float), np.array(xs, dtype=float))


def curve_points(coefficients, xs):
    x_min = float(np.min(xs))
    x_max = float(np.max(xs))
    curve_xs = np.linspace(x_min, x_max, 160)
    curve_ys = polynomial_values(coefficients, curve_xs)
    return [{"x": clean_number(x), "y": clean_number(y)} for x, y in zip(curve_xs, curve_ys)]


def rmse(y_true, y_pred):
    return float(np.sqrt(np.mean((np.array(y_true) - np.array(y_pred)) ** 2)))


def polynomial_interpolation(xs, ys):
    start = time.perf_counter()
    method = "Polynomial Interpolation"
    notes = "Passes exactly through the data points, but high-degree curves can oscillate badly with noisy data."

    xs = np.array(xs, dtype=float)
    ys = np.array(ys, dtype=float)
    degree = len(xs) - 1

    try:
        V = np.vander(xs, degree + 1, increasing=False)
        coefficients = np.linalg.solve(V, ys)
        predictions = polynomial_values(coefficients, xs)
        error = rmse(ys, predictions)
        return make_result(method, coefficients, error, None, None, (time.perf_counter() - start) * 1000, True, None, curve_points(coefficients, xs), notes)
    except Exception as exc:
        return failure_result(method, start, f"Could not build interpolation polynomial: {exc}", notes)


def least_squares_fit(xs, ys, degree):
    start = time.perf_counter()
    method = f"Least Squares degree {degree}"
    notes = "Good for noisy data because it captures the trend without forcing the curve through every point."

    xs = np.array(xs, dtype=float)
    ys = np.array(ys, dtype=float)
    degree = int(degree)

    try:
        V = np.vander(xs, degree + 1, increasing=False)
        normal_left = V.T @ V
        normal_right = V.T @ ys
        coefficients = np.linalg.solve(normal_left, normal_right)
        predictions = polynomial_values(coefficients, xs)
        error = rmse(ys, predictions)
        return make_result(method, coefficients, error, None, None, (time.perf_counter() - start) * 1000, True, None, curve_points(coefficients, xs), notes)
    except Exception as exc:
        return failure_result(method, start, f"Could not compute least squares fit: {exc}", notes)


def linear_regression(xs, ys):
    start = time.perf_counter()
    method = "Linear Regression"
    notes = "Simple least-squares case; useful when the data has an approximately linear trend."

    xs = np.array(xs, dtype=float)
    ys = np.array(ys, dtype=float)

    try:
        x_mean = float(np.mean(xs))
        y_mean = float(np.mean(ys))
        slope = float(np.sum((xs - x_mean) * (ys - y_mean)) / np.sum((xs - x_mean) ** 2))
        intercept = y_mean - slope * x_mean
        coefficients = [slope, intercept]
        predictions = slope * xs + intercept
        error = rmse(ys, predictions)
        return make_result(method, coefficients, error, None, None, (time.perf_counter() - start) * 1000, True, None, curve_points(coefficients, xs), notes)
    except Exception as exc:
        return failure_result(method, start, f"Could not compute linear regression: {exc}", notes)


def run_approximation(args):
    xs = args.get("xs", [])
    ys = args.get("ys", [])
    degree = int(args.get("degree", 2))
    methods = set(args.get("methods", []))

    results = []
    if len(xs) != len(ys) or len(xs) < 2:
        return {"results": [make_result("Input", None, None, None, None, 0, False, "Enter at least two matching x and y values.", [], "")]}

    if "interpolation" in methods:
        results.append(polynomial_interpolation(xs, ys))
    if "least_squares" in methods:
        results.append(least_squares_fit(xs, ys, degree))
    if "linear_regression" in methods:
        results.append(linear_regression(xs, ys))
    return {"results": results}
