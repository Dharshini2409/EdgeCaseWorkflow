# EdgeCase --- Product Definition

## Status

Authoritative product-level definition.

This document defines **what EdgeCase is**. It intentionally does not
prescribe the implementation architecture, framework, agent topology,
database, folder structure, or deployment design.

Those decisions belong to the engineering/research process.

------------------------------------------------------------------------

## 1. Product

**EdgeCase** is a governed agentic exception-resolution platform for
enterprise service operations.

It detects service cases that cannot be safely or confidently resolved
through normal workflows, gathers and reconciles relevant evidence
across connected systems, reasons over policies and constraints,
proposes a resolution, executes authorized actions, verifies the
resulting business state, and escalates when autonomous resolution is
unsafe or impossible.

### Core product promise

> **EdgeCase turns exceptions into verified resolutions.**

------------------------------------------------------------------------

## 2. The Problem

Enterprise automation is strongest on predictable workflows.

The difficult cases are different. They can involve:

-   conflicting information;
-   multiple systems;
-   multiple teams;
-   missing context;
-   previous commitments;
-   policy exceptions;
-   actions requiring approval;
-   external dependencies;
-   uncertainty about ownership;
-   a need to verify the result after action.

Today, these cases often require humans to act as the coordination layer
between systems, policies and teams.

EdgeCase exists to reduce that coordination burden without giving an AI
unrestricted authority.

Freshworks' current product direction explicitly emphasizes domain-aware
agents, enterprise context, governed action across systems, and
MCP-based access to external context for complex cross-departmental
issues. citeturn0search0turn0search1

------------------------------------------------------------------------

## 3. Product Thesis

> **Normal automation handles predictable work. EdgeCase handles the
> exceptions that require contextual investigation, coordinated action
> and verified outcomes.**

EdgeCase is therefore not positioned as a replacement for ordinary
service automation.

It is a specialized resolution layer for difficult cases.

------------------------------------------------------------------------

## 4. Target Users

### Primary

-   customer-service operations teams;
-   enterprise service teams;
-   service-desk operations;
-   operations managers.

### Future

-   IT operations;
-   HR operations;
-   finance operations;
-   procurement;
-   vendor management;
-   logistics;
-   other cross-system service functions.

------------------------------------------------------------------------

## 5. Core User Job

When a difficult service case arrives, the user wants EdgeCase to:

1.  understand what happened;
2.  gather the relevant evidence;
3.  identify contradictions and missing information;
4.  determine applicable policies and constraints;
5.  determine what can safely be done;
6.  propose a resolution;
7.  obtain human approval where necessary;
8.  execute authorized actions;
9.  verify the business outcome;
10. resolve or escalate the case.

------------------------------------------------------------------------

## 6. What EdgeCase Is Not

EdgeCase is not:

-   a generic chatbot;
-   a generic RAG assistant;
-   a ticket summarizer;
-   a generic MCP client;
-   a generic workflow automation tool;
-   a multi-agent demo whose complexity exists only for presentation;
-   an unrestricted autonomous agent;
-   a replacement for every existing service workflow.

Conversation is an interface.

**Resolution is the product outcome.**

------------------------------------------------------------------------

## 7. Product-Level Capability Model

The product should conceptually support:

### Case understanding

Turn a messy case into a structured understanding of facts, evidence,
conflicts and uncertainty.

### Evidence gathering

Obtain relevant information from trusted connected systems.

### Conflict detection

Identify when sources disagree or when a previous commitment conflicts
with current policy/state.

### Policy-aware resolution

Determine applicable constraints and authorization requirements.

### Resolution planning

Produce an actionable, evidence-backed resolution plan.

### Governed execution

Execute only actions that the system is authorized to perform.

### Verification

Determine whether the intended business outcome actually occurred.

### Escalation

Stop safely and provide a useful handoff when autonomous resolution is
inappropriate.

------------------------------------------------------------------------

## 8. Product Outcome

A case is not considered resolved merely because an agent generated a
response or an API returned success.

The desired product outcome is:

> **A traceable, policy-compliant, verified business resolution.**

If that cannot be achieved safely:

> **A justified human escalation.**

------------------------------------------------------------------------

## 9. Product Value

The product should create value through:

-   reduced time to resolution;
-   reduced human coordination effort;
-   fewer unnecessary handoffs;
-   better use of cross-system context;
-   fewer incorrect actions;
-   better visibility into why actions were taken;
-   safer automation of difficult cases;
-   reliable verification of outcomes.

------------------------------------------------------------------------

## 10. Product Boundary

The product architecture should be capable of supporting multiple
domains, but the initial implementation may demonstrate only one.

A narrow implementation is acceptable.

A narrow **product definition** is not.

The hackathon implementation should be treated as a vertical slice of
this broader product.

------------------------------------------------------------------------

## 11. Track Alignment

For the selected hackathon track, Freshworks and MCP should be
meaningful parts of the solution rather than sponsor branding.

Freshworks currently provides Agent Studio for building domain-specific
agents and an MCP Gateway for connecting agentic workflows to external
context and systems. citeturn0search0turn0search1

The implementation should therefore demonstrate how EdgeCase creates
value **through** this ecosystem.

It should not attempt to position itself as a factual replacement for
capabilities Freshworks already provides.

------------------------------------------------------------------------

## 12. Long-Term Product Direction

The long-term platform should be able to extend the same
exception-resolution principles across multiple service domains without
rewriting its core.

Potential future capabilities include:

-   multiple exception classes;
-   domain-specific policy providers;
-   additional evidence sources;
-   additional action providers;
-   additional verification strategies;
-   recurring exception detection;
-   exception analytics;
-   root-cause analysis;
-   automation opportunity discovery;
-   cross-domain resolution.

These are product direction, not hackathon requirements.
