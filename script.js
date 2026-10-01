//CALCULATOR PROGRAM

const display = document.getElementById("display");

function appendToDisplay(input) {
    // Start fresh if the previous calculation errored out.
    if (display.value === "Error") {
        display.value = "";
    }
    display.value += input;
}

function cleardisplay() {
    display.value = "";
}

function calculate() {
    const expression = display.value.trim();
    if (expression === "") return;

    try {
        const result = evaluate(expression);
        if (!isFinite(result)) throw new Error("Math error");
        // Trim floating-point noise (e.g. 0.1 + 0.2) without losing precision.
        display.value = parseFloat(result.toPrecision(12));
    } catch (error) {
        display.value = "Error";
    }
}

// Break the expression into numbers and operator tokens.
function tokenize(expression) {
    const tokens = [];
    let i = 0;

    while (i < expression.length) {
        const char = expression[i];

        if (char === " ") {
            i++;
            continue;
        }

        if (/[0-9.]/.test(char)) {
            let number = "";
            let dots = 0;
            while (i < expression.length && /[0-9.]/.test(expression[i])) {
                if (expression[i] === ".") dots++;
                number += expression[i];
                i++;
            }
            if (dots > 1 || number === ".") throw new Error("Invalid number");
            tokens.push({ type: "number", value: parseFloat(number) });
        } else if ("+-*/()".includes(char)) {
            tokens.push({ type: "operator", value: char });
            i++;
        } else {
            throw new Error("Invalid character");
        }
    }

    return tokens;
}

// Recursive-descent parser that evaluates while respecting operator precedence.
function evaluate(expression) {
    const tokens = tokenize(expression);
    let pos = 0;

    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    function parseExpression() {
        let value = parseTerm();
        while (peek() && (peek().value === "+" || peek().value === "-")) {
            const operator = next().value;
            const right = parseTerm();
            value = operator === "+" ? value + right : value - right;
        }
        return value;
    }

    function parseTerm() {
        let value = parseFactor();
        while (peek() && (peek().value === "*" || peek().value === "/")) {
            const operator = next().value;
            const right = parseFactor();
            value = operator === "*" ? value * right : value / right;
        }
        return value;
    }

    function parseFactor() {
        const token = peek();
        if (!token) throw new Error("Unexpected end of expression");

        // Unary plus/minus, e.g. -5 or +3
        if (token.value === "+" || token.value === "-") {
            next();
            const value = parseFactor();
            return token.value === "-" ? -value : value;
        }

        if (token.value === "(") {
            next();
            const value = parseExpression();
            if (!peek() || peek().value !== ")") throw new Error("Missing closing parenthesis");
            next();
            return value;
        }

        if (token.type === "number") {
            next();
            return token.value;
        }

        throw new Error("Unexpected token");
    }

    const result = parseExpression();
    if (pos < tokens.length) throw new Error("Unexpected token at end");
    return result;
}
