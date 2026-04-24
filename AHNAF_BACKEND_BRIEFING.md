# Ahnaf Test Briefing

Last updated: 2026-04-23

This is a user test briefing for validating the Indiebox backend on `staging`.
The goal is not to test APIs or technical details. The goal is to check whether the backend supports the real operational workflow clearly and consistently.

## Test Environment

- Use only `staging`
- URL: `https://staging.indiebox.ai`
- Do not use production / live for this test

## Access

There are two login steps.

### 1. Browser access via Basic Auth

When opening an admin page, the browser will first ask for Basic Auth:

- Username: `indiebox-admin`
- Password: `9rirt7Xr6xF8`

### 2. App login inside Indiebox

After that, log into the app itself with:

- Username: `ahnaf`
- Password: `ahnaf123`

Ahnaf now has `admin` access on `staging` so he can test the full workflow.

## Main Pages For The Test

- Inventory / stock: `https://staging.indiebox.ai/admin/inventory.html`
- Customer orders: `https://staging.indiebox.ai/admin/orders.html`
- Checkout page for creating test orders if needed: `https://staging.indiebox.ai/checkout.html`

## What Ahnaf Should Understand

The backend covers two connected views of the same process:

1. `Inventory / procurement side`
   This is where new boxes are ordered, expected delivery is tracked, devices are marked as arrived, prepared, installed, and generally moved through stock states.

2. `Customer order side`
   This is where incoming customer orders appear, customer details are visible, and a concrete device can be assigned and moved through fulfillment steps.

The important part of the test is whether these two views feel connected and understandable.

## Workflow Ahnaf Should Test

### A. Procurement and stock workflow

Open `Inventory`.

Ahnaf should check whether he can understand and use this flow:

1. A new supplier order can be created.
   This represents ordering new Indiebox units from a supplier.

2. A supplier order can contain expected arrival information.
   He should be able to see or enter when the boxes are expected to arrive.

3. Ordered units create visible device placeholders.
   The system should make it clear that these are not yet ready customer devices, but incoming stock.

4. When hardware arrives, the device can be moved from `ordered` to `in stock`.
   This should represent physical arrival.

5. The device can then move further through preparation states.
   Relevant states Ahnaf should look for are:
   - `ordered`
   - `in stock`
   - `available`
   - `reserved`
   - `assigned`
   - `installed`

6. He should check whether it is understandable when a box is:
   - only ordered from supplier
   - expected soon
   - physically received
   - ready in stock
   - already tied to a customer
   - already installed/prepared for shipment

### B. Customer order workflow

Open `Orders`.

Ahnaf should check whether he can understand and use this flow:

1. A new customer order appears in the list.
   It should be easy to recognize that a new order exists.

2. The customer details are visible.
   He should be able to see the buyer clearly, including the main contact data and shipping context.

3. Paid orders become actionable.
   It should be understandable which orders are ready for fulfillment and which are not.

4. A device can be mapped to a customer order.
   This is one of the key checks.
   Ahnaf should verify that assigning a concrete device to a concrete customer feels obvious and safe.

5. After assignment, the order should move through fulfillment states.
   Relevant states Ahnaf should look for are:
   - `reserved`
   - `installed`
   - `packed`
   - `shipped`
   - `delivered`
   - `fulfilled`

6. The relationship between device and customer should stay clear.
   He should always understand which physical box belongs to which customer order.

## Concrete Test Story

Ask Ahnaf to mentally walk through this scenario inside the UI:

1. We order new Indiebox units from a supplier.
2. We note when they are expected.
3. The boxes arrive.
4. A specific box is now available in stock.
5. A customer order comes in.
6. We can see the customer and the order details.
7. We assign one available box to that customer.
8. We prepare the machine.
9. We mark it as installed.
10. We pack it.
11. We mark it as shipped.
12. We later mark it as delivered / completed.

The question for the test is:
Can Ahnaf follow this entire story in the backend without needing explanations from us all the time?

## What He Should Pay Attention To

This is the actual feedback we want from him.

### Clarity

- Is it immediately clear where procurement ends and customer fulfillment begins?
- Is it clear which page he should use for which step?
- Is it obvious what each state means?

### Operational confidence

- Would he trust himself to update a real order without fear of breaking something?
- Does assigning a device to a customer feel safe and understandable?
- Can he tell whether a box is still incoming, already on site, prepared, or already sent?

### Consistency

- Do inventory and orders tell the same story?
- If a device is assigned in one place, does that make sense in the other place too?
- Are the terms consistent across the workflow?

### Missing information

- Is any important step invisible?
- Is there any point where he would ask, "what happens next?"
- Is there a place where he needs more detail, for example:
  expected arrival,
  preparation status,
  install status,
  shipping status,
  customer-device mapping

## Suggested Test Tasks

Give Ahnaf these tasks:

1. Log in successfully.
2. Open `Inventory` and explain in his own words what the device states mean.
3. Open `Inventory > Beschaffung` and review supplier orders.
4. Check whether he understands how newly ordered boxes enter the system.
5. Open `Inventory > Geräte` and review the status progression of devices.
6. Open `Orders` and identify which customer orders are new and which are already in fulfillment.
7. Open one order and explain who the customer is and what still needs to happen.
8. Check whether assigning a device to an order is understandable.
9. Check whether the later fulfillment states make sense: installed, packed, shipped, delivered.
10. Report where the workflow feels unclear, incomplete, or too technical.

## Expected Outcome Of The Test

After the session, we want answers to these questions:

- Can a non-technical operator understand the backend workflow?
- Is the stock and procurement flow understandable enough?
- Is the customer-order and fulfillment flow understandable enough?
- Is the device-to-customer assignment clear?
- Are there missing statuses, missing detail, or confusing transitions?

## How Ahnaf Should Document Problems

Please document findings as GitHub issues in this repository:

- Repo: `brainbot-com/indie-landing`
- Issues: `https://github.com/brainbot-com/indie-landing/issues`

Create one issue per problem.
Do not combine unrelated problems into one large ticket.

Good examples:

- one issue for confusing device states
- one issue for missing delivery date visibility
- one issue for unclear customer-device assignment

Each issue should contain:

- what Ahnaf tried to do
- where in the backend he was
- what he expected to happen
- what actually happened
- why this is a problem for an operator
- screenshot if useful

## Suggested Issue Title Format

Use a clear title like:

- `[User test] Inventory: ordered vs in stock is unclear`
- `[User test] Orders: device assignment to customer is confusing`
- `[User test] Fulfillment: shipped and delivered are not clearly separated`

## Suggested Issue Template

Ahnaf can copy this structure:

```md
## Context

Page: Inventory / Orders
Area: Procurement / Devices / Customer order / Fulfillment

## What I tried to do

Describe the task briefly.

## What I expected

Describe the expected behavior or information.

## What happened instead

Describe the actual behavior, missing detail, or confusion.

## Why this matters

Explain why this would slow down or confuse a real operator.

## Screenshot

Add screenshot if helpful.
```

## What Counts As A Problem

Ahnaf should open an issue if:

- a step is hard to understand
- a status is unclear
- the next action is not obvious
- customer and device mapping is confusing
- important operational information is missing
- two parts of the backend tell different stories
- he would hesitate to use the system with a real customer order

If something is only a small wording improvement, he can still log it, but it should be clearly marked as minor.

## Credentials Summary

- Basic Auth username: `indiebox-admin`
- Basic Auth password: `9rirt7Xr6xF8`
- App username: `ahnaf`
- App password: `ahnaf123`
