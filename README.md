# Next.js API Route Generator CLI

Easily generate API route handlers for your Next.js applications with this CLI tool. Create clean and structured API routes effortlessly using predefined templates.

## Features
- **Multiple HTTP Methods:** Support for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- **Predefined Templates:** Choose from basic, parameterized, error-handling, and validation-ready route templates.
- **TypeScript Support:** Option to generate routes in TypeScript or JavaScript.
- **Customizable Base Directory:** Specify where to generate your API routes.
- **Interactive CLI:** Guided step-by-step route generation.

## Installation

To use this CLI tool globally, install it via npm:

```bash
npm install -g next-api-gen
```

Alternatively, you can use `npx` to run it without installation:

```bash
npx next-api-gen
```


## Usage

Run the CLI tool with:

```bash
next-api-gen
```


### Steps in the CLI
1. **Route Name:** Specify the name of the API route (e.g., `users/[id]`).
2. **HTTP Method:** Select the desired HTTP method (`GET`, `POST`, etc.).
3. **Template:** Choose from predefined templates for your route logic.
4. **TypeScript Option:** Decide whether to use TypeScript or JavaScript.
5. **Base Directory:** Specify the base directory for generating routes.

## Examples

### Generate a Basic Route
Follow the CLI prompts and select the "Basic" template to create a simple route with a JSON response:

```
import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({ message: 'Hello from your route!' }, { status: 200 });
}
```


## Configuration

You can customize the behavior of the CLI by passing the following options:

- **Route Name:** The path for your API route (e.g., `products/[id]`).
- **HTTP Method:** Choose from supported methods (`GET`, `POST`, etc.).
- **Template:** Select one of the predefined templates.
- **TypeScript Support:** Enable or disable TypeScript usage.
- **Base Directory:** Define the directory where the route file should be generated.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

Enjoy building your Next.js APIs faster with `next-api-gen`!
