/**
 * Set FIREBASE_SERVICE_ACCOUNT on Railway via their GraphQL API
 * 
 * How to get your Railway API Token:
 *   1. Go to https://railway.app/account/tokens
 *   2. Click "New Token"
 *   3. Give it a name like "deploy-script"
 *   4. Copy the token
 *
 * Run:
 *   $env:RAILWAY_TOKEN="your_token_here"; node scripts/set_railway_env.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const SERVICE_ACCOUNT_VALUE = fs.readFileSync(
    path.join(__dirname, '.firebase_env_value.txt'),
    'utf8'
).trim();

if (!RAILWAY_TOKEN) {
    console.error('❌ Missing RAILWAY_TOKEN environment variable.');
    console.error('   Get it from: https://railway.app/account/tokens');
    console.error('   Then run: $env:RAILWAY_TOKEN="your_token"; node scripts/set_railway_env.js');
    process.exit(1);
}

const BACKEND_URL = 'https://vyaparos-backend-production.up.railway.app';

async function graphQL(query, variables) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query, variables });
        const req = https.request({
            hostname: 'backboard.railway.app',
            path: '/graphql/v2',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RAILWAY_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid JSON response: ' + data)); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log('[1/4] Fetching projects from Railway...');

    const projectsRes = await graphQL(`
        query {
            me {
                projects {
                    edges {
                        node {
                            id
                            name
                            services {
                                edges {
                                    node {
                                        id
                                        name
                                    }
                                }
                            }
                            environments {
                                edges {
                                    node { id name }
                                }
                            }
                        }
                    }
                }
            }
        }
    `);

    if (projectsRes.errors) {
        console.error('❌ GraphQL errors:', JSON.stringify(projectsRes.errors, null, 2));
        if (projectsRes.errors[0]?.message?.includes('Unauthorized')) {
            console.error('   → Token is invalid or expired. Generate a new one at https://railway.app/account/tokens');
        }
        process.exit(1);
    }

    const projects = projectsRes.data?.me?.projects?.edges || [];
    console.log(`   Found ${projects.length} project(s):`);
    projects.forEach(p => console.log(`   → [${p.node.id}] ${p.node.name}`));

    // Find VyaparOS backend project
    const backendProject = projects.find(p =>
        p.node.name.toLowerCase().includes('vyapar') ||
        p.node.name.toLowerCase().includes('backend')
    ) || projects[0];

    if (!backendProject) {
        console.error('❌ No matching project found. Projects:', projects.map(p => p.node.name));
        process.exit(1);
    }

    const project = backendProject.node;
    const service = project.services?.edges?.[0]?.node;
    const environment = project.environments?.edges?.find(e => e.node.name === 'production')?.node
        || project.environments?.edges?.[0]?.node;

    console.log(`\n[2/4] Found:`);
    console.log(`   Project:     ${project.name} (${project.id})`);
    console.log(`   Service:     ${service?.name} (${service?.id})`);
    console.log(`   Environment: ${environment?.name} (${environment?.id})`);

    if (!service || !environment) {
        console.error('❌ Could not find service or environment. Full response:');
        console.error(JSON.stringify(projectsRes.data, null, 2));
        process.exit(1);
    }

    console.log(`\n[3/4] Setting FIREBASE_SERVICE_ACCOUNT (${SERVICE_ACCOUNT_VALUE.length} chars)...`);

    const upsertRes = await graphQL(`
        mutation UpsertVariables($input: VariableCollectionUpsertInput!) {
            variableCollectionUpsert(input: $input)
        }
    `, {
        input: {
            projectId: project.id,
            serviceId: service.id,
            environmentId: environment.id,
            variables: {
                FIREBASE_SERVICE_ACCOUNT: SERVICE_ACCOUNT_VALUE
            }
        }
    });

    if (upsertRes.errors) {
        console.error('❌ Failed to set variable:', JSON.stringify(upsertRes.errors, null, 2));
        process.exit(1);
    }

    console.log('   ✅ FIREBASE_SERVICE_ACCOUNT set successfully!');
    console.log('\n[4/4] Railway will automatically redeploy the backend now (~2 min).');
    console.log(`      Watch: https://railway.app/`);
    console.log('\n🎉 Done! Firebase Admin SDK will be initialized on next deploy.');
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});
