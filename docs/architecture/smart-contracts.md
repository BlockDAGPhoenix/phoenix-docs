# How Smart Contracts Work on Phoenix

## 🎯 Simple Explanation: Smart Contracts on Phoenix

### What is a Smart Contract?

Think of a smart contract like a vending machine. You put money in, select what you want, and the machine automatically gives you the product. No human needed to operate it. Smart contracts work the same way—they're computer programs that automatically execute when certain conditions are met.

### The Challenge: Running Smart Contracts on a DAG

Most blockchains (like Ethereum) work like a train—one block follows another in a straight line. Smart contracts were designed for this simple, linear system.

Phoenix is different. Phoenix uses a DAG (Directed Acyclic Graph), which is more like a web or network where multiple blocks can be created at the same time. This makes Phoenix much faster, but it creates a problem: **smart contracts need things to happen in order**.

Imagine trying to read a book where pages could arrive in any order—you'd be confused! Smart contracts are the same way. They need to know: "Did Alice send money before Bob received it?" or "Was the token minted before it was transferred?"

### Phoenix's Solution: The Magic Translator

Phoenix solves this with something called **canonicalization**—think of it as a smart translator that takes the messy web of blocks and arranges them into a neat, ordered list that smart contracts can understand.

Here's how it works in simple terms:

1. **Blocks are created in parallel** (the DAG part—this makes Phoenix fast)
2. **Phoenix sorts them intelligently** (using blue scores from GHOSTDAG consensus)
3. **Smart contracts see them in order** (like a normal blockchain)
4. **Everything executes correctly** (contracts work exactly like on Ethereum)

### What This Means for You

- ✅ **Your smart contracts work exactly like on Ethereum**—no changes needed
- ✅ **You get Phoenix's speed**—sub-second block times instead of 12+ seconds
- ✅ **All Ethereum tools work**—MetaMask, Hardhat, Remix, everything
- ✅ **You can deploy any Ethereum contract**—ERC-20 tokens, NFTs, DeFi protocols, etc.

### A Real-World Analogy

Imagine a busy restaurant kitchen:

- **Traditional blockchain (Ethereum)**: One chef, one order at a time. Slow but simple.
- **Phoenix DAG**: Multiple chefs cooking different orders simultaneously. Fast!
- **The problem**: The waiters need to know which order came first to serve customers correctly.
- **Phoenix's solution**: A smart manager (canonicalization) looks at all the orders, figures out the correct sequence based on when they were placed, and tells the waiters the right order to serve them.

The customers (smart contracts) just see their orders arrive in the correct sequence—they don't need to know about the complex kitchen operations happening behind the scenes.

---

## 🔧 Technical Deep Dive: Smart Contract Architecture

### Overview

Phoenix Network implements full Ethereum Virtual Machine (EVM) compatibility on top of a BlockDAG consensus layer. This requires a sophisticated translation layer that converts the parallel DAG structure into a deterministic linear sequence for EVM execution.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Consensus Layer (DAG)                    │
│  ┌───┐   ┌───┐   ┌───┐                                     │
│  │ A │───│ D │───│ G │  (Parallel block creation)          │
│  └─┬─┘   └─┬─┘   └───┘                                     │
│    │       │                                               │
│  ┌─┴─┐   ┌─┴─┐                                             │
│  │ B │───│ E │                                             │
│  └───┘   └─┬─┘                                             │
│            │                                                │
│          ┌─┴─┐                                              │
│          │ F │                                              │
│          └───┘                                              │
├─────────────────────────────────────────────────────────────┤
│              Canonicalization Layer                         │
│  • GHOSTDAG blue score calculation                          │
│  • Deterministic sorting algorithm                          │
│  • Topological ordering enforcement                         │
│  • Reorg detection and handling                             │
├─────────────────────────────────────────────────────────────┤
│                    EVM Execution Layer                      │
│  • Ethereum Virtual Machine (go-ethereum)                   │
│  • State Database (Merkle Patricia Trie)                    │
│  • Transaction execution engine                             │
│  • Gas accounting and fee collection                        │
│  • Event log indexing                                       │
└─────────────────────────────────────────────────────────────┘
```

### Canonicalization Process

The canonicalization layer is the critical bridge between DAG consensus and EVM execution. It implements a deterministic algorithm to convert the DAG into a linear sequence.

#### Algorithm Steps

1. **Tip Selection**: Select the set of best tips (leaf blocks) that maximize cumulative blue work
2. **Ancestor Collection**: Gather all ancestors of the selected tip set
3. **Deterministic Sorting**: Sort blocks using a stable, total ordering:
   - Primary: Blue score (descending)
   - Secondary: Timestamp (ascending)
   - Tertiary: Block hash (lexicographic)
4. **Topological Enforcement**: Ensure parents always precede children in the final sequence
5. **Index Assignment**: Assign canonical block numbers (0, 1, 2, ...) to the ordered sequence

#### Implementation

The canonicalization is implemented in `domain/canonical/ordering.go`:

```go
func (cb *CanonicalBuilder) sortBlocksCanonically(blocks []*externalapi.DomainBlock) {
    sort.SliceStable(blocks, func(i, j int) bool {
        blueScoreI := cb.dag.GetBlueScore(blocks[i])
        blueScoreJ := cb.dag.GetBlueScore(blocks[j])
        if blueScoreI != blueScoreJ {
            return blueScoreI > blueScoreJ
        }
        tsI := blocks[i].Header.TimeInMilliseconds()
        tsJ := blocks[j].Header.TimeInMilliseconds()
        if tsI != tsJ {
            return tsI < tsJ
        }
        hashI := consensushashing.BlockHash(blocks[i])
        hashJ := consensushashing.BlockHash(blocks[j])
        return bytes.Compare(hashI.ByteSlice(), hashJ.ByteSlice()) < 0
    })
}
```

### EVM Execution Flow

#### Transaction Processing

When a block is added to the DAG:

1. **Block Reception**: Block arrives with transactions
2. **Canonicalization**: Block is placed in canonical sequence
3. **State Preparation**: EVM Manager loads current state
4. **Transaction Execution**: Each transaction is executed sequentially:

```go
func (m *Manager) ProcessBlock(block *externalapi.DomainBlock, blockNumber uint64) (uint64, []*types.Log, error) {
    totalGasUsed := uint64(0)
    allLogs := []*types.Log{}
    
    // Process all transactions in the block
    for i, tx := range block.Transactions {
        result, err := m.ExecuteTransaction(block, blockNumber, i, tx)
        if err != nil {
            evmManagerLog.Warnf("Transaction execution failed in block %d: %v", blockNumber, err)
            continue
        }
        
        if result != nil {
            totalGasUsed += result.UsedGas
            if len(result.Logs) > 0 {
                allLogs = append(allLogs, result.Logs...)
            }
        }
    }
    
    return totalGasUsed, allLogs, nil
}
```

5. **State Finalization**: State changes are committed to the Merkle Patricia Trie
6. **Checkpoint Creation**: Periodic checkpoints are created for efficient reorg handling

#### Transaction Execution Details

Each transaction goes through the following steps:

```go
func ExecuteTransaction(
    evmConfig *EVMConfig,
    stateDB *state.StateDB,
    block *externalapi.DomainBlock,
    blockNumber uint64,
    txIndex int,
    tx *externalapi.DomainTransaction,
    receiptStore ReceiptStore,
    logIndex LogIndex,
) (*ExecutionResult, error) {
    // 1. Convert Phoenix transaction to Ethereum message
    msg, err := convertTransactionToMessage(tx, block, blockNumber)
    
    // 2. Create block context (block.number, timestamp, etc.)
    blockContext := createBlockContext(block, blockNumber, evmConfig)
    
    // 3. Create transaction context (origin, gas price)
    txContext := vm.TxContext{
        Origin:   msg.From,
        GasPrice: msg.GasPrice,
    }
    
    // 4. Create EVM instance
    evm := vm.NewEVM(blockContext, txContext, stateDB, evmConfig.ChainConfig, evmConfig.VMConfig)
    
    // 5. Execute the transaction
    result, err := core.ApplyMessage(evm, msg, new(core.GasPool).AddGas(msg.GasLimit))
    
    // 6. Finalize state changes
    stateDB.Finalise(false)
    
    return result, nil
}
```

### State Management

Phoenix uses the same state model as Ethereum:

- **Account Model**: Externally Owned Accounts (EOAs) and Contract Accounts
- **State Storage**: Merkle Patricia Trie (MPT) for efficient state root calculation
- **State Root**: Computed per block and included in block header
- **Storage Layout**: Same as Ethereum (32-byte slots, keccak256 hashing)

The state database is implemented using go-ethereum's `state.StateDB`, ensuring full compatibility with Ethereum's state model.

### Block Header Mapping

The EVM receives standard Ethereum block headers, mapped from DAG blocks:

| EVM Field | Phoenix Source | Notes |
|-----------|----------------|-------|
| `number` | Canonical index | Position in linear sequence (0, 1, 2...) |
| `parentHash` | Previous canonical block hash | Hash of L[i-1] |
| `timestamp` | Block timestamp | From DAG block header |
| `gasLimit` | Block gas limit | Configurable, default 30M |
| `gasUsed` | Accumulated from transactions | Sum of all tx gas in block |
| `coinbase` | Miner address | Block creator's reward address |
| `difficulty` | Mapped from DAG difficulty | For EIP-1559 compatibility |
| `baseFee` | EIP-1559 base fee | Calculated per block |

### Reorg Handling

When the canonical chain changes (due to new blocks arriving), Phoenix handles reorgs efficiently:

#### Reorg Detection

1. **Canonical Sequence Rebuild**: New canonical sequence L' is computed
2. **Longest Common Prefix (LCP)**: Find where L and L' diverge
3. **Reorg Depth Check**: Ensure reorg is within `MaxReorgDepth` (default: 100 blocks)

#### Reorg Execution

```go
func Reorg(oldL, newL []*Block, state *State) error {
    lcp := longestCommonPrefix(oldL, newL)
    if len(oldL)-lcp > MaxReorgDepth {
        return ErrReorgTooDeep
    }
    
    // Find nearest checkpoint before divergence point
    cp := nearestCheckpoint(lcp)
    
    // Restore state to checkpoint
    if err := state.RestoreCheckpoint(cp); err != nil {
        return err
    }
    
    // Re-execute blocks from checkpoint forward
    for i := cp; i < len(newL); i++ {
        if err := ExecuteBlock(newL[i], state); err != nil {
            return err
        }
        // Create checkpoint periodically
        if i%CheckpointInterval == 0 {
            state.CreateCheckpoint(i)
        }
    }
    return nil
}
```

#### Checkpoint System

- **Checkpoint Interval**: Every 1024 blocks (configurable)
- **Checkpoint Storage**: State root + block number stored in database
- **Replay Optimization**: Only replay from last checkpoint, not from genesis

### Gas Model

Phoenix implements EIP-1559 gas pricing:

- **Base Fee**: Calculated per block based on target utilization
- **Priority Fee**: User-specified tip to miners
- **Gas Limit**: Per-block limit (default: 30,000,000)
- **Gas Accounting**: Standard EVM gas costs (same as Ethereum)

Gas fees are collected and distributed to miners (block creators) as rewards.

### Contract Deployment

Contract deployment follows Ethereum's standard process:

1. **Transaction Creation**: User sends transaction with contract bytecode in `data` field
2. **Address Derivation**: Contract address = `keccak256(RLP([sender, nonce]))[12:]`
3. **Code Storage**: Contract bytecode stored in state database
4. **Constructor Execution**: Constructor runs during deployment
5. **State Initialization**: Contract storage initialized

```go
// Contract address derivation (before execution)
senderNonce := stateDB.GetNonce(msg.From)
createdAddr := crypto.CreateAddress(msg.From, senderNonce)
```

### Event Logging

Events are emitted during contract execution and indexed:

- **Log Structure**: Same as Ethereum (address, topics[], data)
- **Log Indexing**: Indexed by block number, transaction index, and log index
- **Event Filtering**: Supports standard Ethereum event filters via JSON-RPC

### Read-Only Calls

Phoenix supports read-only contract calls (via `eth_call`):

```go
func (m *Manager) Call(
    from common.Address,
    to common.Address,
    data []byte,
    value *big.Int,
    gasLimit uint64,
    blockNumber *big.Int,
) ([]byte, error) {
    // Use snapshot for read-only execution
    snapshot := m.stateDB.Snapshot()
    defer m.stateDB.RevertToSnapshot(snapshot)
    
    // Execute call without modifying state
    result, err := core.ApplyMessage(evm, msg, gasPool)
    return result.ReturnData, nil
}
```

The snapshot mechanism ensures read-only calls never modify state.

### Compatibility Guarantees

Phoenix maintains full compatibility with Ethereum:

- **EVM Opcodes**: All opcodes behave identically
- **Gas Costs**: Same gas costs as Ethereum
- **ABI Encoding**: Standard ABI encoding/decoding
- **Event Format**: Standard event log format
- **JSON-RPC API**: Full EIP-1474 compliance
- **ERC Standards**: All ERC standards work (ERC-20, ERC-721, ERC-1155, etc.)

### Performance Characteristics

- **Block Processing**: ~50ms for canonical sequence rebuild (10k blocks)
- **Reorg Replay**: ~10s for max reorg depth (100 blocks) with checkpoints
- **State Checkpoint Size**: ~5GB at 10M accounts (tunable)
- **Transaction Throughput**: Target 1,000+ TPS (vs Ethereum's ~15 TPS)

### Security Considerations

1. **Determinism**: Canonicalization is fully deterministic—same DAG produces same sequence
2. **Reorg Bounds**: Max reorg depth limits prevents excessive replay
3. **State Consistency**: Checkpoints ensure state integrity during reorgs
4. **Gas Limits**: Per-block gas limits prevent resource exhaustion
5. **EVM Isolation**: Each transaction executes in isolated EVM context

### Testing and Validation

Phoenix validates EVM compatibility through:

- **Ethereum State Tests**: Passes official Ethereum test suite
- **Determinism Tests**: Randomized block arrival orders produce identical results
- **Reorg Tests**: Random forks tested for correct replay behavior
- **Contract Tests**: Standard Solidity contracts tested for compatibility

---

## See Also

- [EVM Integration](evm-integration.md) - Overview of EVM integration
- [Consensus](consensus.md) - GHOSTDAG consensus mechanism
- [Smart Contract Development](../developers/smart-contracts.md) - Developer guide
- [Canonicalization Specification](../reference/specs/core-node/CANONICALIZATION_DETAILED.md) - Detailed technical spec
- [DAG-EVM Master Specification](../reference/specs/dag-evm/DAG_EVM_MASTER_SPECIFICATION.md) - Complete architecture spec

