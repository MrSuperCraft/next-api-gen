#!/usr/bin/env node

import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import path from 'path';
import color from 'picocolors';
import fs from 'fs';

const HttpMethod = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const defaultConfig = {
    useTypeScript: false,
    baseDir: process.cwd(),
};

const templates = {
    basic: {
        name: 'Basic',
        description: 'A simple API route with a JSON response',
        getContent: (method, routeName, useTypeScript) => `
import { ${useTypeScript ? 'NextRequest, ' : ''}NextResponse } from 'next/server';

export async function ${method}(request${useTypeScript ? ': NextRequest' : ''}) {
  return NextResponse.json({ message: 'Hello from ${routeName}!' }, { status: 200 });
}
`
    },
    withParams: {
        name: 'With Params',
        description: 'An API route that handles path and query parameters',
        getContent: (method, routeName, useTypeScript) => `
import { ${useTypeScript ? 'NextRequest, ' : ''}NextResponse } from 'next/server';

export async function ${method}(request${useTypeScript ? ': NextRequest' : ''}, { params }${useTypeScript ? ': { params: { [key: string]: string } }' : ''}) {
  const queryParams = request.nextUrl.searchParams
  return NextResponse.json({
    message: 'Hello from ${routeName}!',
    pathParams: params,
    queryParams,
  });
}
`
    },
    withErrorHandling: {
        name: 'With Error Handling',
        description: 'An API route with built-in error handling',
        getContent: (method, routeName, useTypeScript) => `
import { ${useTypeScript ? 'NextRequest, ' : ''}NextResponse } from 'next/server';

export async function ${method}(request${useTypeScript ? ': NextRequest' : ''}) {
  try {
    // Your logic here
    return NextResponse.json({ message: 'Hello from ${routeName}!' }, { status: 200 });
  } catch (error) {
    console.error('Error in ${routeName}:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`
    },
    withValidation: {
        name: 'With Validation',
        description: 'An API route with request body validation',
        getContent: (method, routeName, useTypeScript) => `
import { ${useTypeScript ? 'NextRequest, ' : ''}NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function ${method}(request${useTypeScript ? ': NextRequest' : ''}) {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return NextResponse.json({ message: 'Data validated successfully', data: validatedData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error in ${routeName}:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`
    },
};

async function generateApiRoute({ routeName, config, options = {} }) {
    const startTime = performance.now();

    try {
        const { useTypeScript = defaultConfig.useTypeScript, baseDir = defaultConfig.baseDir } = options;
        const extension = useTypeScript ? 'ts' : 'js';
        const routeParts = routeName.split('/');

        const filePath = path.join(baseDir, 'app', 'api', ...routeParts, `route.${extension}`);

        const content = config.template.getContent(config.method, routeName, useTypeScript);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);

        const endTime = performance.now();
        console.log(`✅ API route handler generated: ${filePath} (${(endTime - startTime).toFixed(2)}ms)`);
    } catch (error) {
        console.error(`❌ Error generating API route handler ${routeName}:`, error);
    }
}

async function main() {
    console.clear();

    const s = p.spinner();
    s.start('Initializing Next.js API Route Generator');
    await setTimeout(1000);
    s.stop('Next.js API Route Generator initialized');

    p.intro(`${color.cyan('Welcome to the Next.js API Route Generator!')}
${color.dim('Create API routes with ease for your Next.js application.')}`);

    const steps = ['Route Name', 'HTTP Method', 'Template', 'TypeScript', 'Base Directory'];
    const answers = {};
    let currentStep = 0;

    while (currentStep < steps.length) {
        const step = steps[currentStep];
        p.log.step(`${currentStep + 1}. ${step}`);

        let answer;
        switch (step) {
            case 'Route Name':
                answer = await p.text({
                    message: 'Enter the route name (e.g., users/[id]):',
                    validate: (value) => {
                        if (value.trim() === '') return 'Route name cannot be empty';
                        return;
                    },
                    initialValue: answers.routename || '',
                });
                break;
            case 'HTTP Method':
                answer = await p.select({
                    message: 'Select the HTTP method:',
                    options: [
                        ...HttpMethod.map(m => ({ value: m, label: m })),
                        { value: 'back', label: 'Go back' }
                    ],
                    initialValue: answers.httpmethod,
                });
                break;
            case 'Template':
                answer = await p.select({
                    message: 'Choose a template:',
                    options: [
                        ...Object.entries(templates).map(([key, template]) => ({
                            value: key,
                            label: `${template.name} - ${template.description}`,
                        })),
                        { value: 'back', label: 'Go back' }
                    ],
                    initialValue: answers.template,
                });
                break;
            case 'TypeScript':
                answer = await p.confirm({
                    message: 'Use TypeScript?',
                    initialValue: answers.typescript !== undefined ? answers.typescript : defaultConfig.useTypeScript,
                });
                break;
            case 'Base Directory':
                answer = await p.text({
                    message: 'Enter the base directory (leave empty for current directory):',
                    initialValue: answers.basedirectory || defaultConfig.baseDir,
                });
                break;
        }

        if (p.isCancel(answer)) {
            p.cancel('Operation cancelled.');
            process.exit(0);
        }

        if (answer === 'back') {
            currentStep = Math.max(0, currentStep - 1);
        } else {
            answers[step.toLowerCase().replace(' ', '')] = answer;
            currentStep++;
        }
    }

    const config = {
        method: answers.httpmethod,
        template: templates[answers.template],
    };

    const options = {
        useTypeScript: answers.typescript,
        baseDir: answers.basedirectory || defaultConfig.baseDir,
    };

    const s2 = p.spinner();
    s2.start('Generating API route');
    await generateApiRoute({ routeName: answers.routename, config, options });
    s2.stop('API route generated successfully');

    p.outro(`${color.green('API route generation complete!')}
${color.dim('Your new API route is ready to use.')}`);
}

main().catch((error) => {
    console.error(color.red('An error occurred:'), error);
    process.exit(1);
});

