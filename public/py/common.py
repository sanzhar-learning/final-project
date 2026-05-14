import math
import time
import numpy as np


def clean_number(value):
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return value
    if not math.isfinite(number):
        return None
    return number


def clean_list(values):
    return [clean_number(value) for value in values]


def make_result(
    method,
    result=None,
    error=None,
    residual=None,
    iterations=None,
    runtime_ms=0.0,
    converged=False,
    failure_reason=None,
    history=None,
    notes="",
):
    return {
        "method": method,
        "result": clean_list(result) if isinstance(result, (list, tuple, np.ndarray)) else clean_number(result),
        "error": clean_number(error),
        "residual": clean_number(residual),
        "iterations": iterations,
        "runtime_ms": clean_number(runtime_ms) or 0.0,
        "converged": bool(converged),
        "failure_reason": failure_reason,
        "history": history or [],
        "notes": notes,
    }


def failure_result(method, start_time, reason, notes=""):
    return make_result(
        method=method,
        runtime_ms=(time.perf_counter() - start_time) * 1000,
        converged=False,
        failure_reason=reason,
        notes=notes,
    )


def make_function(expr):
    expression = str(expr).replace("^", "**")
    safe_names = {
        "np": np,
        "math": math,
        "sin": np.sin,
        "cos": np.cos,
        "tan": np.tan,
        "sqrt": np.sqrt,
        "exp": np.exp,
        "log": np.log,
        "abs": abs,
        "pi": math.pi,
        "e": math.e,
    }

    def f(x):
        return eval(expression, {"__builtins__": {}}, {**safe_names, "x": x})

    return f


def sample_function(f, a, b, count=160):
    xs = np.linspace(float(a), float(b), count)
    points = []
    for x in xs:
        try:
            y = clean_number(f(float(x)))
        except Exception:
            y = None
        points.append({"x": clean_number(x), "y": y})
    return points


def vector_norm(values):
    return float(np.linalg.norm(np.array(values, dtype=float)))
