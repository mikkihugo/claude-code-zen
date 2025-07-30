#!/usr/bin/env node

/* Example: ruv-FANN Neural Network Integration with Claude Zen */
/** This example demonstrates how to use the ruv-FANN Node.js bindings integrated with the Claude Zen ecosystem */

import {
  createNeuralNetwork,
  getNeuralBackendInfo,
  getNeuralServiceStatus,
  initializeNeuralService,
  predictWithNetwork,
  trainNeuralNetwork,
} from '../src/neural/integration.js';

async function main() {
  console.warn('🧠 Claude Zen + ruv-FANN Neural Network Example\n');

  try {
    // Initialize the neural service
    console.warn('🔧 Initializing neural service...');
    await initializeNeuralService();

    const backendInfo = getNeuralBackendInfo();
    console.warn(`🖥️ Using ${backendInfo.backend} backend (${backendInfo.version})`);
    console.warn(`🚀 GPU Available: ${backendInfo.gpuSupport}`);

    // Example 1: XOR Problem (Classic neural network test)
    console.warn('\n📚 Example 1: XOR Neural Network');
    console.warn('Creating neural network for XOR problem...');

    await createNeuralNetwork('xor-solver', [2, 4, 1], {
      description: 'Simple XOR problem solver network',
    });

    // Training data for XOR problem
    const xorData = {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      outputs: [[0], [1], [1], [0]],
    };

    console.warn('🎯 Training network on XOR data...');
    const xorError = await trainNeuralNetwork('xor-solver', xorData, {
      learning_rate: 0.7,
      max_epochs: 1000,
      desired_error: 0.001,
    });

    console.warn(`✅ Training completed with final error: ${xorError.toFixed(6)}`);

    // Test the XOR network
    console.warn('\n🧪 Testing XOR network:');
    for (let i = 0; i < xorData.inputs.length; i++) {
      const input = xorData.inputs[i];
      const expected = xorData.outputs[i][0];
      const prediction = await predictWithNetwork('xor-solver', input);
      const result = prediction[0];

      console.warn(`   ${input[0]} XOR ${input[1]} = ${result.toFixed(3)} (expected: ${expected})`);
    }

    // Example 2: Pattern Recognition
    console.warn('\n🎨 Example 2: Simple Pattern Recognition');
    console.warn('Creating pattern recognition network...');

    await createNeuralNetwork('pattern-recognizer', [8, 10, 3], {
      description: 'Simple 8x1 to 3-class pattern recognizer',
    });

    // Generate simple patterns (vertical, horizontal, diagonal)
    const patternData = {
      inputs: [
        // Vertical patterns
        [1, 1, 0, 0, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        // Horizontal patterns
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        // Diagonal patterns
        [1, 0, 0, 1, 1, 0, 0, 1],
        [0, 1, 1, 0, 0, 1, 1, 0],
      ],
      outputs: [
        [1, 0, 0], // vertical
        [1, 0, 0], // vertical
        [0, 1, 0], // horizontal
        [0, 1, 0], // horizontal
        [0, 0, 1], // diagonal
        [0, 0, 1], // diagonal
      ],
    };

    console.warn('🎯 Training pattern recognition network...');
    const patternError = await trainNeuralNetwork('pattern-recognizer', patternData, {
      learning_rate: 0.5,
      max_epochs: 2000,
      desired_error: 0.01,
    });

    console.warn(`✅ Pattern training completed with final error: ${patternError.toFixed(6)}`);

    // Test pattern recognition
    console.warn('\n🧪 Testing pattern recognition:');
    const testPatterns = [
      { input: [1, 1, 0, 0, 1, 1, 0, 0], expected: 'vertical' },
      { input: [1, 0, 1, 0, 1, 0, 1, 0], expected: 'horizontal' },
      { input: [1, 0, 0, 1, 1, 0, 0, 1], expected: 'diagonal' },
    ];

    for (const test of testPatterns) {
      const prediction = await predictWithNetwork('pattern-recognizer', test.input);
      const maxIndex = prediction.indexOf(Math.max(...prediction));
      const patterns = ['vertical', 'horizontal', 'diagonal'];

      console.warn(`   Pattern ${test.input.join('')}: ${patterns[maxIndex]} (expected: ${test.expected})`);
      console.warn(`   Confidence: ${(prediction[maxIndex] * 100).toFixed(1)}%`);
    }

    // Show service status
    console.warn('\n📊 Neural Service Status:');
    const status = getNeuralServiceStatus();
    console.warn(`   Networks created: ${status.networksCreated}`);
    console.warn(`   Total predictions: ${status.totalPredictions}`);
    console.warn(`   Service uptime: ${status.uptime}ms`);

    console.warn('\n🎉 Neural network integration example completed successfully!');

  } catch (error) {
    console.error('❌ Neural network example failed:', error);
    process.exit(1);
  }
}

// Execute the example
main().catch(console.error);
