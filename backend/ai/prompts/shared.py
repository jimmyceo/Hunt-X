"""
Ported from career-ops/modes/_shared.md
System context, rules, and scoring logic
"""

# Archetype detection signals
ARCHETYPE_SIGNALS = {
    "AI_PLATFORM_LLMOps": [
        "observability", "evals", "pipelines", "monitoring",
        "reliability", "production", "scaling", "infrastructure"
    ],
    "AGENTIC_AUTOMATION": [
        "agent", "HITL", "orchestration", "workflow",
        "multi-agent", "autonomous", "automation"
    ],
    "TECHNICAL_AI_PM": [
        "PRD", "roadmap", "discovery", "stakeholder",
        "product manager", "requirements", "user research"
    ],
    "AI_SOLUTIONS_ARCHITECT": [
        "architecture", "enterprise", "integration",
        "design", "systems", "technical design"
    ],
    "AI_FORWARD_DEPLOYED": [
        "client-facing", "deploy", "prototype", "fast delivery",
        "field", "customer", "implementation"
    ],
    "AI_TRANSFORMATION": [
        "change management", "adoption", "enablement",
        "transformation", "strategy", "organizational"
    ]
}

# Scoring interpretation
SCORE_INTERPRETATION = {
    4.5: "Strong match, recommend applying immediately",
    4.0: "Good match, worth applying",
    3.5: "Decent but not ideal, apply only if specific reason",
    0.0: "Recommend against applying"
}

# Professional writing rules
PROFESSIONAL_WRITING_RULES = """
## Professional Writing & ATS Compatibility Rules

### Avoid cliché phrases:
- "passionate about" / "results-oriented" / "proven track record"
- "leveraged" (use "used" or name the tool)
- "spearheaded" (use "led" or "ran")
- "facilitated" (use "ran" or "set up")
- "synergies" / "robust" / "seamless" / "cutting-edge" / "innovative"
- "in today's fast-paced world"
- "demonstrated ability to" / "best practices" (name the practice)

### Prefer specifics over abstractions:
- "Cut p95 latency from 2.1s to 380ms" beats "improved performance"
- "Postgres + pgvector for retrieval over 12k docs" beats "designed scalable RAG architecture"
- Name tools, projects, and customers when allowed

### Vary sentence structure:
- Don't start every bullet with the same verb
- Mix sentence lengths (short. Then longer with context. Short again.)
- Don't always use "X, Y, and Z" — sometimes two items, sometimes four
"""

# System rules from _shared.md
SYSTEM_RULES = """
## Global Rules

### NEVER:
1. Invent experience or metrics
2. Modify user CV data
3. Submit applications on behalf of candidate
4. Share phone number in generated messages
5. Recommend comp below market rate
6. Use corporate-speak
7. Ignore the tracker

### ALWAYS:
1. Cite exact lines from CV when matching
2. Detect role archetype and adapt framing
3. Use WebSearch for comp and company data
4. Be direct and actionable — no fluff
5. Generate content in the language of the JD (EN default)
6. Native tech English: Short sentences, action verbs, no passive voice
7. Prefer specifics over abstractions
"""
