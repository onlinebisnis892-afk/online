# WZ MANAGE PRO ONLINE — FUNCTION IMPLEMENTATION

This revision only adds business-function infrastructure to the existing 14-module blueprint.
It does not remove modules/features.

Implemented in this revision:
- Generic CRUD API for all principal persisted business entities.
- Branch, employee, customer, service, promotion, booking, queue, transaction, finance, attendance, shift, payroll, commission, notification, inventory, permissions, preferences, locks, schedules and system records are addressable through `/api/data/[entity]`.
- Conservative feature status registry remains separate from the blueprint.

A feature is only marked complete when its dedicated business rule and integration are verified.
