# Principle 3: Understandable

Information and UI operation must be understandable.

## 3.1 Readable

### 3.1.1 Language of Page (A)

Default language is programmatically determined.

```html
<!-- English page -->
<html lang="en">

<!-- Japanese page -->
<html lang="ja">

<!-- Chinese (Simplified) -->
<html lang="zh-Hans">

<!-- Chinese (Traditional) -->
<html lang="zh-Hant">
```

### 3.1.2 Language of Parts (AA)

Language changes are identified.

```html
<p>The French phrase <span lang="fr">c'est la vie</span> means "that's life".</p>

<blockquote lang="de">
  Ich bin ein Berliner.
</blockquote>
<p>— John F. Kennedy</p>
```

**Common language codes**:
| Language | Code |
|----------|------|
| English | en |
| Japanese | ja |
| Chinese (Simplified) | zh-Hans |
| Korean | ko |
| Spanish | es |
| French | fr |
| German | de |
| Portuguese | pt |
| Arabic | ar |

---

## 3.2 Predictable

### 3.2.1 On Focus (A)

Focus doesn't trigger context change.

**Violations**:
- Submitting form on focus
- Opening new window on focus
- Moving focus automatically

```javascript
// Bad: Auto-submit on focus
input.addEventListener('focus', () => form.submit());

// Good: Require explicit action
input.addEventListener('change', () => updatePreview());
button.addEventListener('click', () => form.submit());
```

### 3.2.2 On Input (A)

Input doesn't automatically trigger context change.

**Violations**:
- Auto-redirect on select change
- Auto-submit on input

```html
<!-- Bad: Auto-redirect -->
<select onchange="window.location = this.value">
  <option value="/en">English</option>
  <option value="/ja">Japanese</option>
</select>

<!-- Good: Explicit action -->
<select id="language">
  <option value="/en">English</option>
  <option value="/ja">Japanese</option>
</select>
<button onclick="changeLanguage()">Change Language</button>
```

### 3.2.3 Consistent Navigation (AA)

Navigation is consistent across pages.

**Requirements**:
- Same navigation order on all pages
- Same components in same relative order
- Consistent placement of search, login, etc.

### 3.2.4 Consistent Identification (AA)

Same functionality has same label.

```html
<!-- Good: Consistent labels -->
Page 1: <button>Search</button>
Page 2: <button>Search</button>

<!-- Bad: Inconsistent labels -->
Page 1: <button>Search</button>
Page 2: <button>Find</button>
Page 3: <button>Look up</button>
```

---

## 3.3 Input Assistance

### 3.3.1 Error Identification (A)

Errors are identified and described in text.

```html
<!-- Bad: Error indicated only visually -->
<input style="border-color: red;">

<!-- Good: Error with text description -->
<label for="email">Email address</label>
<input type="email"
       id="email"
       aria-invalid="true"
       aria-describedby="email-error">
<span id="email-error" class="error">
  Please enter a valid email address (e.g., user@example.com)
</span>
```

### 3.3.2 Labels or Instructions (A)

Input fields have labels or instructions.

```html
<!-- Good: Label and instructions -->
<label for="password">Password</label>
<input type="password"
       id="password"
       aria-describedby="password-hint">
<span id="password-hint" class="hint">
  Must be at least 8 characters with one number
</span>

<!-- Good: Required field indication -->
<label for="name">
  Full name <span aria-hidden="true">*</span>
  <span class="visually-hidden">(required)</span>
</label>
<input type="text" id="name" required aria-required="true">
```

### 3.3.3 Error Suggestion (AA)

Error messages suggest corrections when known.

```html
<!-- Good: Specific error with suggestion -->
<span id="date-error" class="error">
  Invalid date format. Please use MM/DD/YYYY (e.g., 12/25/2024)
</span>

<!-- Good: Suggest valid options -->
<span id="country-error" class="error">
  Country not recognized. Did you mean "United States" or "United Kingdom"?
</span>

<!-- Bad: Generic error -->
<span class="error">Invalid input</span>
```

### 3.3.4 Error Prevention (Legal, Financial, Data) (AA)

For legal/financial/data submissions:
- Reversible: Submissions can be reversed
- Checked: Data is checked for errors
- Confirmed: User can review before submitting

```html
<!-- Confirmation step -->
<h2>Review Your Order</h2>
<dl>
  <dt>Product</dt>
  <dd>Widget Pro</dd>
  <dt>Quantity</dt>
  <dd>2</dd>
  <dt>Total</dt>
  <dd>$199.98</dd>
</dl>
<button onclick="goBack()">Edit Order</button>
<button onclick="confirmOrder()">Confirm Purchase</button>

<!-- Data deletion confirmation -->
<dialog role="alertdialog" aria-labelledby="delete-title">
  <h2 id="delete-title">Delete Account?</h2>
  <p>This action cannot be undone. All your data will be permanently deleted.</p>
  <button onclick="cancel()">Cancel</button>
  <button onclick="confirmDelete()">Yes, Delete My Account</button>
</dialog>
```

---

## Form Error Handling Pattern

### Complete Example

```html
<form novalidate onsubmit="return validateForm()">
  <h1>Contact Form</h1>

  <!-- Error summary (appears on submit) -->
  <div id="error-summary" role="alert" hidden>
    <h2>Please correct the following errors:</h2>
    <ul id="error-list"></ul>
  </div>

  <!-- Name field -->
  <div class="form-group">
    <label for="name">
      Full name
      <span class="required" aria-hidden="true">*</span>
    </label>
    <input type="text"
           id="name"
           name="name"
           required
           aria-required="true"
           aria-describedby="name-error">
    <span id="name-error" class="error" hidden></span>
  </div>

  <!-- Email field -->
  <div class="form-group">
    <label for="email">
      Email address
      <span class="required" aria-hidden="true">*</span>
    </label>
    <input type="email"
           id="email"
           name="email"
           required
           aria-required="true"
           aria-describedby="email-error email-hint">
    <span id="email-hint" class="hint">
      We'll never share your email
    </span>
    <span id="email-error" class="error" hidden></span>
  </div>

  <!-- Submit -->
  <button type="submit">Send Message</button>
</form>

<script>
function validateForm() {
  const errors = [];

  // Validate name
  const name = document.getElementById('name');
  if (!name.value.trim()) {
    showError('name', 'Please enter your name');
    errors.push({ field: 'name', message: 'Name is required' });
  }

  // Validate email
  const email = document.getElementById('email');
  if (!email.value.trim()) {
    showError('email', 'Please enter your email address');
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email.value)) {
    showError('email', 'Please enter a valid email (e.g., user@example.com)');
    errors.push({ field: 'email', message: 'Email format is invalid' });
  }

  if (errors.length > 0) {
    showErrorSummary(errors);
    document.getElementById(errors[0].field).focus();
    return false;
  }

  return true;
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);

  field.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  error.hidden = false;
}
</script>
```

---

## Testing Checklist

```
3.1.1 Language of Page:
- [ ] html has lang attribute
- [ ] lang code is correct

3.1.2 Language of Parts:
- [ ] Foreign phrases marked with lang

3.2.1-3.2.2 Predictable:
- [ ] No auto-submit on focus/input
- [ ] No unexpected navigation

3.3.1 Error Identification:
- [ ] Errors described in text
- [ ] aria-invalid on error fields
- [ ] Error associated with field

3.3.2 Labels:
- [ ] All inputs have labels
- [ ] Required fields indicated
- [ ] Instructions provided

3.3.3 Error Suggestion:
- [ ] Errors explain how to fix
- [ ] Valid formats shown

3.3.4 Error Prevention:
- [ ] Review before submit (legal/financial)
- [ ] Confirmation for destructive actions
```
