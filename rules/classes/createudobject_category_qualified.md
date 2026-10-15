---
id: createudobject_category_qualified
title: Instantiate user classes as Category.ClassName
domain: classes
status: active
level: authoritative
severity: error
applies_to: [server_script, class]
rule: >-
  Use `CreateUdObject("Category.ClassName")` for user-defined classes; a bare
  class name is looked up only among the default categories.
categories: [classes]
machine: { list: must_follow, foundation: non_negotiable }
related_elements: [CreateUdObject]
enforced_by: [reviewer]
schema:
  - path: object_oriented.object_creation.user_defined_objects.note
    form: text
    message: >-
      CreateUdObject() returns an empty dynamic object; string forms
      instantiate a :CLASS script named as Category.ClassName. A bare class
      name is looked up only among the default categories, so for a class in
      your own category it raises: There is no script with name: <name> among
      default categories.
verification:
  basis: observed
  note: >-
    Kept from the classes pack, which states it word for word. Merged: the
    foundation's "User-defined classes instantiate with
    CreateUdObject("Category.ClassName").", the skills, the agent guide's
    quick start rule 7 and object creation section, and the schema's
    user_defined_objects.note (word for word).
---

## Rationale

A class file is a script in a category. Without the category, the lookup
searches only the default categories and raises `There is no script with
name: <name> among default categories.` for a class in your own category.

## Examples

### Good

```ssl
:DECLARE oCounter;

oCounter := CreateUdObject("Samples.Counter");
oCounter:Increment();
```

### Bad

```ssl
:DECLARE oCounter;
oCounter := CreateUdObject("Counter");
oCounter:Increment();
```
