# Numerical Algorithms Test Suite

A final project for a Mathematical Foundations of Computing / Numerical Algorithms course.

The app is an interactive dashboard where a user enters mathematical data, runs several numerical algorithms on the same problem, and compares the behavior of the methods. The focus is educational: correctness, convergence, runtime, iterations, and useful failure cases.

The numerical algorithms are written in simple Python and run directly in the browser through Pyodide. There is no backend server, database, authentication, or API layer.

## Features

- Modern React dashboard with dark mode, animated cards, and clear charts.
- Python algorithms kept simple and readable in `public/py`.
- Shared algorithm result format for easy comparison.
- Root-finding module:
  - Bisection Method
  - Newton's Method
  - Fixed-Point Iteration
- Linear systems module:
  - Gaussian Elimination
  - Jacobi Method
  - Gauss-Seidel Method
- Approximation and interpolation module:
  - Polynomial Interpolation
  - Least Squares Approximation
  - Linear Regression
- Per-module comparison table and quick verdict cards.

## How to Run

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

The first page load may take a moment because Pyodide and NumPy are loaded in the browser.

## Project Structure

```text
public/py/
  common.py
  root_finding.py
  linear_systems.py
  approximation.py

src/
  App.tsx
  pyodide/
  pages/
  ui/
```

The Python files contain the numerical methods. The React files provide the dashboard, inputs, result cards, charts, and comparison tables.

## Demo Examples

### Root Finding

Default problem:

```text
f(x) = x**2 - 3
interval = [1, 2]
x0 = 1.5
```

Expected root: about `1.732`.

Expected conclusion:

- Bisection is slower but reliable when the interval is valid.
- Newton's method usually converges faster but depends on the starting point and derivative.
- Fixed-point iteration works when the transformation `g(x)` is suitable.

### Linear Systems

Default system:

```text
A = [
  [4, 1, 2],
  [1, 5, 1],
  [2, 1, 3]
]

b = [4, 6, 7]
```

Expected conclusion:

- Gaussian elimination is a direct method and works well for this small system.
- Jacobi is simple but may need more iterations.
- Gauss-Seidel often converges faster than Jacobi.

### Approximation and Interpolation

Default data points are noisy samples near:

```text
y = 2x + 1
```

Expected conclusion:

- Interpolation passes through all points but may overfit noisy data.
- Least squares captures the general trend.
- Linear regression is a simple and useful least-squares case for nearly linear data.

## Shared Result Format

Every algorithm returns a dictionary with comparable fields:

```python
{
    "method": "Bisection",
    "result": root,
    "error": error,
    "residual": residual,
    "iterations": iterations,
    "runtime_ms": runtime,
    "converged": True,
    "failure_reason": None,
    "history": history,
    "notes": "When this method is useful"
}
```

## Presentation Outline

Suggested 10-minute structure:

1. Project title and motivation.
2. What problem the project solves.
3. Why comparing algorithms matters.
4. Explanation of the three modules.
5. Demo 1: root-finding comparison.
6. Demo 2: linear system comparison.
7. Demo 3: approximation and interpolation comparison.
8. Results and comparison tables.
9. Conclusions: which algorithms are better in which situations.
10. Limitations and future improvements.

## Limitations and Future Work

- Newton's method uses a numerical derivative instead of symbolic differentiation.
- Pyodide adds a larger first page load than a normal JavaScript-only app.
- The project intentionally avoids advanced numerical methods to keep the code easy to present.
- Possible future additions: Secant Method, LU Decomposition, spline interpolation, and exportable reports.
# final-project
