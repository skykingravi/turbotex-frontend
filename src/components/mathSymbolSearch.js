import React, { useState } from "react";

const mathSymbols = [
    // Arithmetic Operators
    { symbol: "+", code: "+", text: "plus" },
    { symbol: "-", code: "-", text: "minus" },
    { symbol: "×", code: "\\times", text: "multiplication" },
    { symbol: "÷", code: "\\div", text: "division" },
    { symbol: "=", code: "=", text: "equal to" },
    { symbol: "≠", code: "\\neq", text: "not equal to" },
    { symbol: "<", code: "<", text: "less than" },
    { symbol: ">", code: ">", text: "greater than" },
    { symbol: "≤", code: "\\leq", text: "less than or equal to" },
    { symbol: "≥", code: "\\geq", text: "greater than or equal to" },
    { symbol: "±", code: "\\pm", text: "plus or minus" },
    { symbol: "∓", code: "\\mp", text: "minus or plus" },

    // Greek Letters
    { symbol: "α", code: "\\alpha", text: "alpha" },
    { symbol: "β", code: "\\beta", text: "beta" },
    { symbol: "γ", code: "\\gamma", text: "gamma" },
    { symbol: "δ", code: "\\delta", text: "delta" },
    { symbol: "ε", code: "\\epsilon", text: "epsilon" },
    { symbol: "ζ", code: "\\zeta", text: "zeta" },
    { symbol: "η", code: "\\eta", text: "eta" },
    { symbol: "θ", code: "\\theta", text: "theta" },
    { symbol: "ι", code: "\\iota", text: "iota" },
    { symbol: "κ", code: "\\kappa", text: "kappa" },
    { symbol: "λ", code: "\\lambda", text: "lambda" },
    { symbol: "μ", code: "\\mu", text: "mu" },
    { symbol: "ν", code: "\\nu", text: "nu" },
    { symbol: "ξ", code: "\\xi", text: "xi" },
    { symbol: "π", code: "\\pi", text: "pi" },
    { symbol: "ρ", code: "\\rho", text: "rho" },
    { symbol: "σ", code: "\\sigma", text: "sigma" },
    { symbol: "τ", code: "\\tau", text: "tau" },
    { symbol: "υ", code: "\\upsilon", text: "upsilon" },
    { symbol: "φ", code: "\\phi", text: "phi" },
    { symbol: "χ", code: "\\chi", text: "chi" },
    { symbol: "ψ", code: "\\psi", text: "psi" },
    { symbol: "ω", code: "\\omega", text: "omega" },

    // Uppercase Greek Letters
    { symbol: "Γ", code: "\\Gamma", text: "uppercase gamma" },
    { symbol: "Δ", code: "\\Delta", text: "uppercase delta" },
    { symbol: "Θ", code: "\\Theta", text: "uppercase theta" },
    { symbol: "Λ", code: "\\Lambda", text: "uppercase lambda" },
    { symbol: "Ξ", code: "\\Xi", text: "uppercase xi" },
    { symbol: "Π", code: "\\Pi", text: "uppercase pi" },
    { symbol: "Σ", code: "\\Sigma", text: "uppercase sigma" },
    { symbol: "Υ", code: "\\Upsilon", text: "uppercase upsilon" },
    { symbol: "Φ", code: "\\Phi", text: "uppercase phi" },
    { symbol: "Ψ", code: "\\Psi", text: "uppercase psi" },
    { symbol: "Ω", code: "\\Omega", text: "uppercase omega" },

    // Relations
    { symbol: "∝", code: "\\propto", text: "proportional to" },
    { symbol: "∈", code: "\\in", text: "element of" },
    { symbol: "∉", code: "\\notin", text: "not an element of" },
    { symbol: "⊂", code: "\\subset", text: "subset of" },
    { symbol: "⊃", code: "\\supset", text: "superset of" },
    { symbol: "⊆", code: "\\subseteq", text: "subset or equal to" },
    { symbol: "⊇", code: "\\supseteq", text: "superset or equal to" },
    { symbol: "∅", code: "\\emptyset", text: "empty set" },
    { symbol: "≃", code: "\\simeq", text: "similar to" },
    { symbol: "≈", code: "\\approx", text: "approximately equal to" },
    { symbol: "≅", code: "\\cong", text: "congruent to" },
    { symbol: "≡", code: "\\equiv", text: "identically equal to" },

    // Logical Symbols
    { symbol: "∧", code: "\\land", text: "logical and" },
    { symbol: "∨", code: "\\lor", text: "logical or" },
    { symbol: "¬", code: "\\neg", text: "logical not" },
    { symbol: "⇒", code: "\\implies", text: "implies" },
    { symbol: "⇔", code: "\\iff", text: "if and only if" },

    // Set Symbols
    { symbol: "{", code: "\\{", text: "left brace" },
    { symbol: "}", code: "\\}", text: "right brace" },
    { symbol: "∪", code: "\\cup", text: "union" },
    { symbol: "∩", code: "\\cap", text: "intersection" },
    { symbol: "⊎", code: "\\uplus", text: "disjoint union" },
    { symbol: "|", code: "\\mid", text: "divides" },
    { symbol: "||", code: "\\parallel", text: "parallel" },

    // Miscellaneous Symbols
    { symbol: "∞", code: "\\infty", text: "infinity" },
    { symbol: "√", code: "\\sqrt{}", text: "square root" },
    { symbol: "∑", code: "\\sum", text: "summation" },
    { symbol: "∏", code: "\\prod", text: "product" },
    { symbol: "∫", code: "\\int", text: "integral" },
    { symbol: "∂", code: "\\partial", text: "partial derivative" },
    { symbol: "∇", code: "\\nabla", text: "nabla or del" },
    { symbol: "∴", code: "\\therefore", text: "therefore" },
    { symbol: "∵", code: "\\because", text: "because" },
    { symbol: "⊥", code: "\\perp", text: "perpendicular to" },
    { symbol: "⊤", code: "\\top", text: "top" },
    { symbol: "⊢", code: "\\vdash", text: "proves" },
    { symbol: "⊣", code: "\\dashv", text: "is dual to" },

    // Arrows
    { symbol: "→", code: "\\to", text: "right arrow" },
    { symbol: "←", code: "\\leftarrow", text: "left arrow" },
    { symbol: "↔", code: "\\leftrightarrow", text: "left and right arrow" },
    { symbol: "⇐", code: "\\Leftarrow", text: "double left arrow" },
    { symbol: "⇒", code: "\\Rightarrow", text: "double right arrow" },
    {
        symbol: "⇔",
        code: "\\Leftrightarrow",
        text: "double left and right arrow",
    },
    { symbol: "↑", code: "\\uparrow", text: "up arrow" },
    { symbol: "↓", code: "\\downarrow", text: "down arrow" },
    { symbol: "⇑", code: "\\Uparrow", text: "double up arrow" },
    { symbol: "⇓", code: "\\Downarrow", text: "double down arrow" },
];

const MathSymbolSearch = ({ handleInsert, setShowMathSymbols }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSymbols = mathSymbols.filter(
        ({ symbol, code, text }) =>
            symbol.includes(searchTerm) ||
            code.includes(searchTerm) ||
            text.includes(searchTerm)
    );

    const handleClick = (code) => {
        handleInsert(code);
        setShowMathSymbols(false);
    };

    return (
        <div className="math-symbols-wrapper">
            <input
                type="text"
                value={searchTerm}
                placeholder="Theta..."
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
                {filteredSymbols.map(({ symbol, code }, index) => (
                    <span key={index} onClick={() => handleClick(code)}>
                        {symbol}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default MathSymbolSearch;
