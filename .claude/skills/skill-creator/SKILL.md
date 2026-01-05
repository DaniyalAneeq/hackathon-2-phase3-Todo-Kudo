# Skill Creator

A comprehensive guide for creating effective skills that extend Claude Code's capabilities with specialized knowledge, workflows, or tool integrations.

## What Are Skills?

Skills are specialized prompt expansions that give Claude Code domain-specific knowledge, structured workflows, or integrated tool capabilities. When invoked, a skill loads its instructions into the conversation context, enabling Claude to perform specialized tasks with expert-level guidance.

## When to Create a skill

Create a skill when you have:

1. **Specialized Domain Knowledge**: Expert knowledge in a specific area (e.g., security auditing, database optimization, API design)
2. **Repeatable Workflows**: Multi-step processes you execute frequently (e.g., code review checklists, deployment procedures)
3. **Tool Integration Patterns**: Common patterns for using specific tools or frameworks (e.g., Docker workflows, testing strategies)
4. **Domain-Specific Standards**: Coding standards, architectural patterns, or best practices for a technology stack

## Skill Structure

A skill is defined in a `SKILL.md` file within `.claude/skills/<skill-name>/` directory:

```
.claude/
   skills/
       <skill-name>/
           SKILL.md
```

## Anatomy of an Effective SKILL.md

### 1. Header and Purpose

Start with a clear, concise title and purpose statement:

```markdown
# [Skill Name]

[1-2 sentence description of what this skill does and when to use it]

## Purpose

[Detailed explanation of the skill's purpose, scope, and key capabilities]
```

### 2. Core Capabilities

Define what the skill enables Claude to do:

```markdown
## Core Capabilities

- **Capability 1**: Description of what this enables
- **Capability 2**: Description of what this enables
- **Capability 3**: Description of what this enables
```

### 3. Invocation Context

Specify when and how the skill should be used:

```markdown
## When to Use This Skill

Use this skill when:
- [Trigger condition 1]
- [Trigger condition 2]
- [Trigger condition 3]

Do NOT use this skill for:
- [Anti-pattern 1]
- [Anti-pattern 2]
```

### 4. Execution Guidelines

Provide step-by-step workflows or decision trees:

```markdown
## Execution Workflow

### Phase 1: [Phase Name]
1. [Step 1 with clear action]
2. [Step 2 with clear action]
   - [Sub-step if needed]
   - [Sub-step if needed]

### Phase 2: [Phase Name]
1. [Step 1]
2. [Step 2]

## Decision Points

When [condition], choose:
- **Option A**: [When to use]   [Action]
- **Option B**: [When to use]   [Action]
```

### 5. Templates and Examples

Include reusable templates or concrete examples:

```markdown
## Templates

### [Template Name]

\```[language]
[Template code or structure]
\```

## Examples

### Example 1: [Scenario]

**Input:**
\```
[Example input]
\```

**Expected Output:**
\```
[Example output]
\```

**Explanation:**
[Why this approach was taken]
```

### 6. Quality Standards

Define what "done" looks like:

```markdown
## Acceptance Criteria

Every output must:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Validation Checklist

Before completing, verify:
1. [Check 1]
2. [Check 2]
3. [Check 3]
```

### 7. Integration Points

Specify how the skill interacts with tools and other systems:

```markdown
## Tool Usage

### Required Tools
- **[Tool Name]**: Used for [purpose]
- **[Tool Name]**: Used for [purpose]

### Tool Patterns

When [scenario]:
1. Use [Tool] to [action]
2. Use [Tool] to [action]
3. Verify with [Tool]
```

## Best Practices

### DO:

 **Be Specific and Actionable**
- Use concrete, executable steps
- Provide clear decision criteria
- Include measurable outcomes

 **Structure for Scannability**
- Use headers, lists, and formatting
- Break complex workflows into phases
- Highlight key decision points

 **Include Examples**
- Show concrete inputs and outputs
- Demonstrate edge cases
- Provide templates when applicable

 **Define Boundaries**
- Specify when to use the skill
- Specify when NOT to use the skill
- Clarify scope and limitations

 **Integrate with Ecosystem**
- Reference relevant tools
- Link to related skills or commands
- Follow project conventions

### DON'T:

L **Be Vague or Abstract**
- Avoid high-level platitudes
- Don't assume context
- Don't use ambiguous language

L **Create Monolithic Skills**
- Keep skills focused on one domain
- Break complex workflows into multiple skills
- Avoid feature creep

L **Ignore Error Cases**
- Address what to do when things fail
- Provide fallback strategies
- Include troubleshooting guidance

L **Assume Tool Knowledge**
- Explicitly state which tools to use
- Show how to use tools correctly
- Provide tool configuration if needed

## Skill Templates

### Minimal Skill Template

```markdown
# [Skill Name]

[Brief description]

## Purpose

[Detailed purpose and scope]

## When to Use

- [Trigger 1]
- [Trigger 2]

## Workflow

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

### Comprehensive Skill Template

```markdown
# [Skill Name]

[Brief description]

## Purpose

[Detailed purpose, scope, and key capabilities]

## Core Capabilities

- **[Capability 1]**: [Description]
- **[Capability 2]**: [Description]

## When to Use This Skill

Use when:
- [Trigger 1]
- [Trigger 2]

Do NOT use for:
- [Anti-pattern 1]
- [Anti-pattern 2]

## Execution Workflow

### Phase 1: [Phase Name]
1. [Step 1]
2. [Step 2]

### Phase 2: [Phase Name]
1. [Step 1]
2. [Step 2]

## Decision Points

When [condition]:
- **Option A**: [When]   [Action]
- **Option B**: [When]   [Action]

## Templates

### [Template Name]

\```[language]
[Template code]
\```

## Tool Usage

### Required Tools
- **[Tool]**: [Purpose]

### Tool Patterns
1. [Pattern description]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Validation Checklist

1. [Check 1]
2. [Check 2]

## Examples

### Example 1: [Scenario]

**Input:**
\```
[Input]
\```

**Output:**
\```
[Output]
\```
```

## Common Skill Patterns

### 1. Code Review Skill Pattern

```markdown
# Code Review Specialist

## Review Phases
1. **Structural Analysis**: Architecture, patterns, organization
2. **Quality Check**: Standards, best practices, maintainability
3. **Security Audit**: Vulnerabilities, data handling, auth
4. **Performance Review**: Bottlenecks, optimization opportunities

## Review Criteria
- [ ] Code follows project standards
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Tests are comprehensive
```

### 2. Documentation Generation Pattern

```markdown
# Documentation Generator

## Documentation Types
1. **API Documentation**: Endpoints, parameters, examples
2. **Architecture Docs**: System design, data flow
3. **User Guides**: How-to, tutorials, FAQs

## Template Selection
- API   OpenAPI/Swagger format
- Architecture   ADR format
- User Guide   Tutorial format
```

### 3. Testing Strategy Pattern

```markdown
# Testing Strategist

## Test Pyramid
1. **Unit Tests**: Functions, methods, components
2. **Integration Tests**: Module interactions
3. **E2E Tests**: User workflows

## Coverage Requirements
- Unit: 80% minimum
- Integration: Critical paths
- E2E: Happy path + key error scenarios
```

### 4. Refactoring Guide Pattern

```markdown
# Refactoring Guide

## Analysis Phase
1. Identify code smells
2. Measure complexity
3. Find duplication

## Refactoring Phase
1. Write characterization tests
2. Apply refactoring pattern
3. Verify behavior unchanged

## Validation Phase
1. Run full test suite
2. Check performance
3. Review readability
```

## Testing Your Skill

### Validation Checklist

Before publishing a skill, verify:

1. **Clarity**
   - [ ] Purpose is immediately clear
   - [ ] Workflows are step-by-step
   - [ ] Examples are concrete

2. **Completeness**
   - [ ] All phases are covered
   - [ ] Error cases are addressed
   - [ ] Acceptance criteria are defined

3. **Usability**
   - [ ] Instructions are actionable
   - [ ] Tool usage is explicit
   - [ ] Decision points are clear

4. **Quality**
   - [ ] No ambiguous language
   - [ ] Consistent formatting
   - [ ] Proper scope boundaries

### Test Cases

Test your skill with:

1. **Happy Path**: Standard use case
2. **Edge Cases**: Boundary conditions
3. **Error Cases**: What happens when things fail
4. **Integration**: How it works with other skills/tools

## Skill Maintenance

### When to Update

Update your skill when:
- New tools become available
- Workflows evolve
- Best practices change
- User feedback identifies gaps

### Version History

Consider adding a changelog:

```markdown
## Changelog

### v1.1.0 (2025-01-15)
- Added support for new testing framework
- Improved error handling guidance

### v1.0.0 (2025-01-01)
- Initial release
```

## Advanced Patterns

### Conditional Workflows

```markdown
## Workflow Selection

Detect project type:
- If `package.json`   Node.js workflow
- If `requirements.txt`   Python workflow
- If `Cargo.toml`   Rust workflow

Then apply language-specific standards.
```

### Skill Composition

```markdown
## Prerequisites

This skill works best when combined with:
- **[Skill Name]**: For [purpose]
- **[Skill Name]**: For [purpose]

## Workflow Integration

1. First, run [Other Skill] to [prepare]
2. Then, use this skill to [execute]
3. Finally, validate with [Another Skill]
```

### Context-Aware Behavior

```markdown
## Context Detection

Before executing:
1. Check if in git repository
2. Detect programming language
3. Identify project structure
4. Load relevant standards

Then adapt workflow to context.
```

## Resources and References

### Skill Examples in the Wild

Study these patterns:
- Code review checklist skills
- API documentation generators
- Security audit frameworks
- Performance optimization guides

### Related Documentation

- Claude Code Documentation
- MCP Server Integration
- Slash Command Reference
- Project Constitution Guidelines

---

## Quick Start Guide

Ready to create your first skill? Follow these steps:

1. **Identify the Need**: What repeatable task needs structure?
2. **Define the Scope**: What's in and out of scope?
3. **Outline the Workflow**: What are the key steps?
4. **Add Examples**: Show concrete inputs/outputs
5. **Set Quality Standards**: Define acceptance criteria
6. **Test It**: Run through several scenarios
7. **Iterate**: Refine based on actual usage

Remember: Start simple, iterate based on usage, and keep skills focused!
