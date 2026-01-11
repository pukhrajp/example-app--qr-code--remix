### Troubleshooting

Use this guide when the cursor isn't showing or doesn't behave as expected.

### Cursor not showing at all

#### 1) Confirm the App embed is enabled

- Shopify Admin -> Online Store -> Themes -> Customize
- Theme settings -> App embeds
- **Custom Cursor** must be **On**
- Click **Save**

#### 2) Confirm App embed setting: "Enable Custom Cursor"

Inside the embed settings:

- **Enable Custom Cursor** should be **On**

#### 3) Check "Disable on Mobile Devices"

If you are testing on:

- a phone/tablet, or
- Chrome DevTools responsive mode, or
- a laptop with a touchscreen

...then the app may treat your device as mobile/tablet.

- If **Disable on Mobile Devices** is ON, the cursor will be disabled.

Try:

- Turn **Disable on Mobile Devices** OFF temporarily, click **Save**, and test again.

#### 4) Confirm you published a cursor in the app

In the app dashboard:

- Select a cursor
- Click **Save & Publish**

If no cursor is published, the storefront has nothing to apply.

### Cursor changed in app but storefront still shows old cursor

This is usually cache.

- The storefront caches cursor settings for about **5 minutes**.

Try one of these:

- Wait 5 minutes and refresh
- Hard refresh (Ctrl/Cmd + Shift + R)
- Test in an Incognito/Private window

Advanced (optional): clear site data for your storefront domain in your browser.

### Hover cursor not showing

- Hover cursor only appears if a cursor has a **hover image**.
- Upload a hover image (or select a cursor that includes one), then **Save & Publish**.

Also verify you are hovering a real interactive element such as:

- buttons
- links
- inputs

### Default pointer appears in some whitespace areas

This was fixed by applying cursor styles to html, body, and a full-viewport layer.

If you still see default pointer:

- Hard refresh
- Disable other "cursor" apps or custom theme code that sets `cursor: auto` or `cursor: default`

### Conflicts with other apps or theme code

If you use other apps that change cursors, add custom CSS, or inject scripts, they can override cursor styles.

Try:

- Temporarily disable other cursor-related apps
- Temporarily remove custom CSS that sets `cursor:`
- Re-test

### Still stuck?

Collect this info and share it with support/dev:

- Store domain (your `*.myshopify.com`)
- Theme name
- Whether the app embed is enabled
- Whether "Disable on Mobile Devices" is enabled
- Screenshot/video of the issue
- Browser + device (desktop/mobile)
