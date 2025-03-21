# VRGDA Simulator

A comprehensive simulator for Variable Rate Gradual Dutch Auctions (VRGDA), designed to be the go-to tool for understanding and experimenting with VRGDA mechanics.

## What is VRGDA?

Variable Rate Gradual Dutch Auction (VRGDA) is an advanced token distribution mechanism designed by Paradigm. It improves upon traditional Dutch auctions by dynamically adjusting the price based on the current supply and demand.

Key features of VRGDA:
- **Target Rate Mechanism**: The auction aims to sell tokens at a predetermined rate over time
- **Dynamic Pricing**: Price decreases if sales are below target, increases if sales exceed target
- **Efficient Distribution**: Prevents early buyers from monopolizing supply while maintaining price efficiency
- **Fair Launch**: Better distribution among participants and reduced gas wars

## Simulator Features

1. **Multiple Predefined Scenarios**:
   - Standard Auction: Sales closely follow the target rate with minor variations
   - Slow Start: Initial sales below target, causing price to decrease rapidly
   - Demand Surge: Sales exceeding target rate, driving prices higher
   - Volatile Market: Alternating periods of high and low demand
   - Long-Term (30 Days): Extended auction period to observe long-term behavior
   - Custom Settings: Configure your own parameters

2. **Comprehensive Visualizations**:
   - Price Dynamics: See how token price adjusts based on sales relative to target
   - Sales Rate: Compare actual sales per hour against the target rate
   - Cumulative Sales: Track total tokens sold over time
   - Revenue: Analyze hourly and cumulative revenue in SOL

3. **Interactive Controls**:
   - Adjust target sale rate, initial price, decay constant, and other parameters
   - See real-time updates of auction metrics
   - Simulate purchase events with timeline visualization

4. **Educational Components**:
   - Detailed explanation of the VRGDA formula
   - Visual demonstration of price behavior in different scenarios
   - Real-world applications and use cases

## VRGDA Formula Explained

The core formula for VRGDA is:

```
price = targetPrice × decay^(timeSinceStart - targetSaleTime)
```

Where:
- `targetPrice` is the desired starting price in SOL
- `decay` is a parameter controlling how quickly price changes
- `timeSinceStart` is the current time since auction start
- `targetSaleTime` is when this token should have been sold according to the target rate

Price behavior:
- **If Sales < Target**: timeSinceStart > targetSaleTime, resulting in a positive exponent and lower price
- **If Sales > Target**: timeSinceStart < targetSaleTime, resulting in a negative exponent and higher price
- **If Sales = Target**: timeSinceStart = targetSaleTime, resulting in price = targetPrice × decay^0 = targetPrice

## Project Structure

```
├── index.html       # Main simulator interface
├── simulator.js     # JavaScript for all simulation functionality
├── styles.css       # CSS styles for the interface
└── README.md        # Project documentation
```

## Getting Started

To run the simulator locally:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/vrgda-simulator.git
   cd vrgda-simulator
   ```

2. Open `index.html` in a modern web browser

3. Select a scenario or configure custom parameters

4. Click "Run Simulation" to see the results

## Browser Compatibility

The simulator works best in modern browsers that support ES6+ JavaScript features and the latest Chart.js library:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

Potential improvements for future versions:

1. Export simulation data to CSV for further analysis
2. Integration with actual on-chain VRGDA implementations
3. Additional scenario templates for specific use cases (NFTs, tokens, etc.)
4. Comparative analysis between different auction mechanisms
5. Mobile-optimized interface

## Resources

- [Paradigm's VRGDA Research](https://www.paradigm.xyz/2022/08/vrgda)
- [VRGDA Implementation Reference](https://github.com/transmissions11/VRGDAs)
- [Dutch Auction Basics](https://en.wikipedia.org/wiki/Dutch_auction)

## License

MIT 