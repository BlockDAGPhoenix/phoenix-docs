/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  gettingStarted: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/overview',
        'getting-started/installation',
        'getting-started/quickstart',
      ],
    },
  ],

  userGuides: [
    {
      type: 'category',
      label: 'User Guides',
      items: [
        'user-guides/node',
        'user-guides/wallet-mobile',
        'user-guides/wallet-extension',
        'user-guides/explorer',
        'user-guides/mining',
      ],
    },
  ],

  developers: [
    {
      type: 'category',
      label: 'Developer Documentation',
      items: [
        'developers/sdk-js',
        'developers/sdk-python',
        'developers/sdk-go',
        'developers/smart-contracts',
        'developers/devtools',
      ],
    },
  ],

  apiReference: [
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/rpc',
        'api-reference/sdk-js',
        'api-reference/sdk-python',
        'api-reference/sdk-go',
        'api-reference/explorer-api',
      ],
    },
  ],

  architecture: [
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/node',
        'architecture/consensus',
        'architecture/evm-integration',
        'architecture/smart-contracts',
        'architecture/network',
      ],
    },
  ],

  operators: [
    {
      type: 'category',
      label: 'Operator Guides',
      items: [
        'operators/node-setup',
        'operators/monitoring',
        'operators/troubleshooting',
        'operators/infrastructure',
      ],
    },
  ],

  tutorials: [
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/first-dapp',
        'tutorials/deploy-contract',
        'tutorials/setup-pool',
        'tutorials/integrate-sdk',
      ],
    },
  ],

  reference: [
    {
      type: 'category',
      label: 'Reference',
      items: [
        {
          type: 'category',
          label: 'Network Parameters',
          items: [
            'reference/network-parameters',
            'reference/chain-ids',
            'reference/eip-conformance',
          ],
        },
        {
          type: 'category',
          label: 'Technical Specifications',
          items: [
            {
              type: 'category',
              label: 'Core Node',
              items: [
                'reference/specs/core-node/CONSENSUS',
                'reference/specs/core-node/CANONICALIZATION',
                'reference/specs/core-node/CANONICALIZATION_DETAILED',
                'reference/specs/core-node/CANONICALIZATION_ENHANCED',
                'reference/specs/core-node/BLOCK_HEADER',
                'reference/specs/core-node/REORG_HANDLING',
                'reference/specs/core-node/IMPLEMENTATION_GUIDE',
              ],
            },
            {
              type: 'category',
              label: 'EVM',
              items: [
                'reference/specs/evm/EXECUTION',
                'reference/specs/evm/RPC',
                'reference/specs/evm/EVM_CONTEXT_MAPPING',
                'reference/specs/evm/EVM_INTEGRATION_DETAILED',
              ],
            },
            {
              type: 'category',
              label: 'DAG-EVM',
              items: [
                'reference/specs/dag-evm/DAG_EVM_MASTER_SPECIFICATION',
                'reference/specs/dag-evm/EXECUTIVE_SUMMARY_AND_RECOMMENDATIONS',
                'reference/specs/dag-evm/EDGE_CASES_AND_ERROR_HANDLING',
                'reference/specs/dag-evm/TEST_SCENARIOS_AND_VALIDATION',
                'reference/specs/dag-evm/README',
              ],
            },
            {
              type: 'category',
              label: 'Mining',
              items: [
                'reference/specs/mining/ALGORITHMS',
                'reference/specs/mining/POOL_PROTOCOL',
              ],
            },
            {
              type: 'category',
              label: 'SDKs',
              items: [
                'reference/specs/sdk/JS_TS',
                'reference/specs/sdk/PYTHON',
                'reference/specs/sdk/GO',
              ],
            },
            {
              type: 'category',
              label: 'Developer Tools',
              items: [
                'reference/specs/devtools/HARDHAT',
                'reference/specs/devtools/FOUNDRY',
                'reference/specs/devtools/REMIX',
                'reference/specs/devtools/DEPLOY_PLAYBOOK',
                'reference/specs/devtools/POLICY_GATE',
              ],
            },
            {
              type: 'category',
              label: 'Wallets',
              items: [
                'reference/specs/wallet/MOBILE',
                'reference/specs/wallet/EXTENSION',
              ],
            },
            {
              type: 'category',
              label: 'Explorer',
              items: [
                'reference/specs/explorer/BLOCKSCOUT',
              ],
            },
            {
              type: 'category',
              label: 'Infrastructure',
              items: [
                'reference/specs/rpc/GATEWAY',
                'reference/specs/ops/SEED_NODES',
                'reference/specs/ops/MONITORING',
                'reference/specs/pool/POOL_SOFTWARE',
              ],
            },
            {
              type: 'category',
              label: 'Security',
              items: [
                'reference/specs/security/EIP_CONFORMANCE',
                'reference/specs/security/STATIC_RULESET',
              ],
            },
            {
              type: 'category',
              label: 'Testing',
              items: [
                'reference/specs/testing/DAG_TEST_SCENARIOS',
                'reference/specs/testing/CONTRACT_TEST_SUITE',
                'reference/specs/testing/DAG_COMPREHENSIVE_TESTS',
                'reference/specs/testing/REORG_HARNESS_SPEC',
              ],
            },
            {
              type: 'category',
              label: 'Other',
              items: [
                'reference/specs/contracts/TEMPLATES_SPEC',
                'reference/specs/bridges/LAYERZERO',
                'reference/specs/oracles/REDSTONE',
                'reference/specs/indexing/THE_GRAPH',
                'reference/specs/developers/DEVELOPER_TEST_GUIDE',
                'reference/specs/developers/DEVELOPER_REQUIREMENTS_ANALYSIS',
                'reference/specs/developers/CONTRACT_COMPLEXITY_ANALYSIS',
                'reference/specs/SPECS_INDEX',
              ],
            },
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;

