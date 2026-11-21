export const SERIES = "LLM from Scratch";
export const REPO = "https://github.com/spy16/llm-from-scratch";

export type Lesson = { part: number; title: string; concepts: string; builds: string };

export const LESSONS: Lesson[] = [
  { part: 1, title: "Knobs and Nudges", concepts: "derivative, chain rule, backprop, gradient descent", builds: "autograd.rs: a tape of values with + and ×, gradient checks" },
  { part: 2, title: "A Brain Cell", concepts: "loss, neuron, nonlinearity, MLP, training loop", builds: "more ops (tanh, pow, neg), Neuron / Layer / MLP, a full training loop" },
  { part: 3, title: "Counting Letters", concepts: "probability, softmax, cross-entropy, sampling", builds: "our own random number generator; a bigram model that writes made-up names" },
  { part: 4, title: "Tensors", concepts: "shape, strides, matmul, broadcasting", builds: "tensor.rs: an n-d array on one flat buffer" },
  { part: 5, title: "Tensor Autograd", concepts: "backward of matmul / sum / softmax, batching", builds: "the tape again, where every node is a whole tensor" },
  { part: 6, title: "Embeddings", concepts: "embedding table, context window, initialisation, numerical stability", builds: "an MLP language model that reads the last few characters" },
  { part: 7, title: "Tokenizer", concepts: "bytes, BPE merges, encode / decode", builds: "bpe.rs: learn merges from our own text" },
  { part: 8, title: "Attention", concepts: "query / key / value, causal mask, multi-head", builds: "a self-attention layer, checked against the nudge test" },
  { part: 9, title: "Transformer", concepts: "positions, residuals, LayerNorm, the block, GPT", builds: "gpt.rs: the full model" },
  { part: 10, title: "Train It", concepts: "AdamW, learning-rate schedule, validation, generation", builds: "train on tiny-shakespeare and generate text" },
  { part: 11, title: "Make It Fast", concepts: "cache-friendly loops, SIMD, threads, KV cache", builds: "a fast matmul, benchmarks, quick generation" },
];

export type Concept = { id: string; band: string; label: string; part: number; deps: string[]; what: string; why: string };

export const BANDS: [string, string][] = [
  ["math", "Math you need"],
  ["learn", "How anything learns"],
  ["text", "Text as numbers"],
  ["engine", "The engine"],
  ["tf", "Transformer"],
  ["run", "Train and run"],
];

// part 0 = school math, assumed rather than taught.
export const CONCEPTS: Concept[] = [
  { id: "dot", band: "math", label: "Dot product", part: 0, deps: [], what: "Multiply two lists of numbers pair by pair, then add it all up. [1,2,3]·[4,5,6] = 4 + 10 + 18 = 32.", why: "It measures how much two vectors agree. A neuron is a dot product, and so is every attention score." },
  { id: "matmul", band: "math", label: "Matrix multiply", part: 0, deps: ["dot"], what: "Lots of dot products at once: every row of A dotted with every column of B. Shapes must line up: (m×k)·(k×n) gives (m×n).", why: "Most of an LLM's compute is matmul. One layer is one matmul." },
  { id: "explog", band: "math", label: "exp and log", part: 0, deps: [], what: "exp turns any number into a positive one and grows fast. log undoes exp, and turns multiplying into adding.", why: "Softmax uses exp to make scores positive. The loss uses log so tiny probabilities become big, readable penalties." },
  { id: "prob", band: "math", label: "Probability", part: 0, deps: [], what: "A list of non-negative numbers that add up to 1, one per possible outcome.", why: "This is exactly an LLM's output: one probability for every token it knows." },

  { id: "deriv", band: "learn", label: "Derivative", part: 1, deps: [], what: "How much the output moves when you nudge one input a tiny bit.", why: "Tells each knob which way to turn, and how hard." },
  { id: "backprop", band: "learn", label: "Backprop", part: 1, deps: ["deriv"], what: "Walk the graph backward, multiplying local rates, to get every knob's gradient in one pass.", why: "GPT-2 small has 124M knobs. Nudging each one separately would take 124M forward passes per step." },
  { id: "gd", band: "learn", label: "Gradient descent", part: 1, deps: ["deriv"], what: "Step every knob a little against its gradient. Repeat.", why: "This is what learning literally is." },
  { id: "loss", band: "learn", label: "Loss", part: 2, deps: [], what: "One number that says how wrong the model is. Smaller is better.", why: "Backprop needs a single number at the end to start from: grad = 1." },
  { id: "neuron", band: "learn", label: "Neuron", part: 2, deps: ["dot"], what: "A dot product of inputs and weights, plus a bias, then squashed by a curved function like tanh.", why: "Without the curve, stacking layers collapses into one straight-line function, which can't learn much." },
  { id: "mlp", band: "learn", label: "MLP", part: 2, deps: ["neuron", "matmul"], what: "Layers of neurons, each feeding the next. In matrix form one layer is matmul + bias + squash.", why: "Every transformer block contains one. It's where each token gets thought about." },
  { id: "loop", band: "learn", label: "Training loop", part: 2, deps: ["backprop", "gd", "loss", "mlp"], what: "Forward → loss → backward → update, thousands of times.", why: "The skeleton of every training run, GPT's included." },

  { id: "tokens", band: "text", label: "Tokenizer", part: 7, deps: [], what: "Chops text into pieces and gives each piece an integer id. BPE starts from bytes and keeps merging the most common neighbouring pair.", why: "Models only eat numbers. The tokenizer decides vocabulary size and how long each sequence is." },
  { id: "embed", band: "text", label: "Embeddings", part: 6, deps: ["tokens", "matmul"], what: "A table with one learned vector per token id. Looking up id 42 means taking row 42.", why: "Turns meaningless ids into vectors the model can do math on. Similar tokens drift close together during training." },
  { id: "softmax", band: "text", label: "Softmax", part: 3, deps: ["explog", "prob"], what: "Turns any list of scores (logits) into probabilities: exp each one, then divide by the total.", why: "Used twice: for the next-token output, and inside attention to decide how much to look at each earlier token." },
  { id: "xent", band: "text", label: "Cross-entropy", part: 3, deps: ["softmax", "loss"], what: "Loss = −log(probability given to the correct next token). Gave it 0.9: loss 0.1. Gave it 0.01: loss 4.6.", why: "This is the loss LLMs are trained on." },
  { id: "sample", band: "text", label: "Sampling", part: 3, deps: ["softmax", "prob"], what: "Pick the next token at random, weighted by the probabilities. Temperature makes the pick bolder or safer.", why: "How the model actually writes, one token at a time." },

  { id: "tensor", band: "engine", label: "Tensors", part: 4, deps: ["matmul"], what: "An n-dimensional array stored as one flat buffer, plus a shape and strides that say where element [i][j][k] lives.", why: "Our replacement for NumPy and PyTorch. Every number in the model lives in one." },
  { id: "batch", band: "engine", label: "Batching", part: 5, deps: ["tensor"], what: "Process many examples at once by adding one more dimension.", why: "Smoother gradients and much better use of the CPU." },
  { id: "tgrad", band: "engine", label: "Tensor autograd", part: 5, deps: ["tensor", "backprop"], what: "The part 1 tape, but each node is a whole tensor. Backward of a matmul is two more matmuls with transposes.", why: "Scalar autograd is far too slow for millions of knobs." },

  { id: "attn", band: "tf", label: "Self-attention", part: 8, deps: ["dot", "softmax", "matmul", "embed"], what: "Each token makes a query (what am I looking for?). Every token offers a key (what I contain) and a value (what I pass on). Score = query·key, softmax the scores, take the weighted mix of values.", why: "Lets a token use information from any earlier token. This is the T in GPT." },
  { id: "mask", band: "tf", label: "Causal mask", part: 8, deps: ["attn"], what: "Before the softmax, set the scores for future tokens to −∞ so they get zero weight.", why: "When predicting token 5, the model must not peek at token 6." },
  { id: "mha", band: "tf", label: "Multi-head", part: 8, deps: ["attn"], what: "Run several small attentions side by side, each free to look for something different, then join the results.", why: "One head might track grammar while another tracks who 'she' refers to." },
  { id: "pos", band: "tf", label: "Positions", part: 9, deps: ["embed", "attn"], what: "Attention alone ignores order: 'dog bites man' looks the same as 'man bites dog'. So add a learned vector per position.", why: "Word order carries meaning." },
  { id: "resid", band: "tf", label: "Residuals", part: 9, deps: ["backprop"], what: "Output = x + layer(x). The layer only adds a correction.", why: "Gives gradients a straight road back through dozens of layers, so deep models still train." },
  { id: "norm", band: "tf", label: "LayerNorm", part: 9, deps: ["tensor"], what: "Rescale each token's vector to mean 0 and spread 1, then apply a learned scale and shift.", why: "Keeps numbers from drifting huge or tiny as they pass through many layers." },
  { id: "block", band: "tf", label: "Transformer block", part: 9, deps: ["mha", "mask", "pos", "resid", "norm", "mlp"], what: "LayerNorm → attention (tokens talk to each other) → add back. Then LayerNorm → MLP (each token thinks alone) → add back.", why: "GPT is this block stacked N times." },

  { id: "gpt", band: "run", label: "GPT", part: 9, deps: ["block", "embed", "xent", "tgrad", "batch"], what: "Token embeddings + position embeddings → N blocks → final LayerNorm → one matmul to a score for every token in the vocabulary.", why: "The whole model." },
  { id: "adam", band: "run", label: "AdamW", part: 10, deps: ["gd", "loop"], what: "Gradient descent with memory: each knob keeps a running average of its gradients and their size, and gets its own step size.", why: "Plain gradient descent trains transformers painfully slowly, or not at all." },
  { id: "eval", band: "run", label: "Validation", part: 10, deps: ["xent"], what: "Hold back some text the model never trains on. If training loss falls but held-back loss rises, it is memorising, not learning.", why: "The only honest measure of whether the model is getting better." },
  { id: "gen", band: "run", label: "Generation", part: 10, deps: ["gpt", "sample"], what: "Feed the prompt, get probabilities, sample a token, append it, repeat.", why: "Turns a next-token predictor into something that writes." },
  { id: "kv", band: "run", label: "KV cache", part: 11, deps: ["gen", "attn"], what: "Keys and values of earlier tokens never change, so keep them instead of recomputing them for every new token.", why: "Makes generating long text fast instead of redoing all earlier work at every step." },
  { id: "fast", band: "run", label: "Fast matmul", part: 11, deps: ["matmul", "tensor"], what: "Order the loops so data stays in CPU cache, use SIMD to do 8 multiplies per instruction, and split work across cores.", why: "Matmul is most of the runtime, so a 10× win here is a 10× win everywhere." },
];
