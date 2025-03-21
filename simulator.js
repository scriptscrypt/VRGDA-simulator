document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const priceChartCanvas = document.getElementById('priceChart');
    const secondaryChartCanvas = document.getElementById('secondaryChart');
    const runSimulationBtn = document.getElementById('runSimulation');
    const buyOrders = document.getElementById('buyOrders');
    const sellOrders = document.getElementById('sellOrders');
    
    // Theme toggle
    const themeToggle = document.getElementById('checkbox');

    // Check for saved theme preference or respect OS preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    } else if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = false;
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    // Theme switch event handler
    themeToggle.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateChartsTheme('dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateChartsTheme('light');
        }
    });
    
    // Scenario buttons
    const scenarioNormal = document.getElementById('scenario-normal');
    const scenarioSlow = document.getElementById('scenario-slow');
    const scenarioFast = document.getElementById('scenario-fast');
    const scenarioVolatile = document.getElementById('scenario-volatile');
    const scenarioLongterm = document.getElementById('scenario-longterm');
    const scenarioCustom = document.getElementById('scenario-custom');
    
    // Chart tab buttons
    const chartTabs = document.querySelectorAll('.chart-tab');
    
    // Input fields
    const targetRateInput = document.getElementById('targetRate');
    const initialPriceInput = document.getElementById('initialPrice');
    const decayRateInput = document.getElementById('decayRate');
    const salesVariationInput = document.getElementById('salesVariation');
    const simulationDaysInput = document.getElementById('simulationDays');
    const totalTokensInput = document.getElementById('totalTokens');
    
    // Status display elements
    const currentDayElement = document.getElementById('currentDay');
    const currentPriceElement = document.getElementById('currentPrice');
    const tokensSoldElement = document.getElementById('tokensSold');
    const targetSalesElement = document.getElementById('targetSales');
    const actualSalesElement = document.getElementById('actualSales');
    
    // Configuration
    let totalDays = 7;
    let totalTokens = 70000;
    const hoursPerDay = 24;
    const minutesPerHour = 60;
    let simulationData = null;
    let currentActiveScenario = null;
    let activeChartType = 'price';
    
    // Chart instances
    let priceChart = null;
    let secondaryChart = null;
    
    // Function to update chart theme when toggling dark/light mode
    function updateChartsTheme(theme) {
        const textColor = theme === 'dark' ? '#e2e8f0' : '#1e293b';
        const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
        
        if (priceChart) {
            priceChart.options.scales.x.grid.color = gridColor;
            priceChart.options.scales.y.grid.color = gridColor;
            priceChart.options.scales.x.ticks.color = textColor;
            priceChart.options.scales.y.ticks.color = textColor;
            priceChart.options.plugins.title.color = textColor;
            priceChart.options.plugins.legend.labels.color = textColor;
            priceChart.update();
        }
        
        if (secondaryChart) {
            secondaryChart.options.scales.x.grid.color = gridColor;
            secondaryChart.options.scales.y.grid.color = gridColor;
            secondaryChart.options.scales.x.ticks.color = textColor;
            secondaryChart.options.scales.y.ticks.color = textColor;
            secondaryChart.options.plugins.title.color = textColor;
            secondaryChart.options.plugins.legend.labels.color = textColor;
            secondaryChart.update();
        }
    }
    
    // Initialize the primary price chart
    function initPrimaryChart() {
        if (priceChart) {
            priceChart.destroy();
        }
        
        // Get current theme to set chart colors
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const textColor = currentTheme === 'dark' ? '#e2e8f0' : '#1e293b';
        const gridColor = currentTheme === 'dark' ? '#334155' : '#e2e8f0';
        
        const ctx = priceChartCanvas.getContext('2d');
        
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Target Price',
                        data: [],
                        borderColor: '#6366f1', // Primary color
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.3
                    },
                    {
                        label: 'Actual Price',
                        data: [],
                        borderColor: '#06b6d4', // Secondary color
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 3,
                        pointRadius: 2,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(4) + ' SOL';
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (Days)'
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Token Price (SOL)'
                        },
                        beginAtZero: false,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }
    
    // Initialize the secondary chart based on selected tab
    function initSecondaryChart(chartType) {
        if (secondaryChart) {
            secondaryChart.destroy();
        }
        
        // Get current theme to set chart colors
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const textColor = currentTheme === 'dark' ? '#e2e8f0' : '#1e293b';
        const gridColor = currentTheme === 'dark' ? '#334155' : '#e2e8f0';
        
        const ctx = secondaryChartCanvas.getContext('2d');
        let chartOptions;
        
        switch (chartType) {
            case 'sales':
                chartOptions = {
                    type: 'bar',
                    data: {
                        labels: [], // Will be populated
                        datasets: [
                            {
                                label: 'Actual Sales',
                                data: [],
                                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                                borderColor: 'rgba(99, 102, 241, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Target Sales',
                                data: [],
                                type: 'line',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                borderColor: 'rgba(239, 68, 68, 1)',
                                borderWidth: 2,
                                pointStyle: 'circle',
                                pointRadius: 0,
                                pointHoverRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time (Days)',
                                    color: textColor
                                },
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Tokens Sold Per Hour',
                                    color: textColor
                                },
                                beginAtZero: true,
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Sales Rate vs Target Rate',
                                color: textColor
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' tokens';
                                    }
                                }
                            },
                            legend: {
                                position: 'top',
                                labels: {
                                    color: textColor
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'cumulative':
                chartOptions = {
                    type: 'line',
                    data: {
                        labels: [], // Will be populated
                        datasets: [
                            {
                                label: 'Cumulative Sales',
                                data: [],
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                borderColor: 'rgba(16, 185, 129, 1)',
                                borderWidth: 2,
                                fill: true
                            },
                            {
                                label: 'Target Cumulative Sales',
                                data: [],
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderColor: 'rgba(245, 158, 11, 0.7)',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time (Days)',
                                    color: textColor
                                },
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Total Tokens Sold',
                                    color: textColor
                                },
                                beginAtZero: true,
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Cumulative Token Sales',
                                color: textColor
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' tokens';
                                    }
                                }
                            },
                            legend: {
                                position: 'top',
                                labels: {
                                    color: textColor
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'revenue':
                chartOptions = {
                    type: 'bar',
                    data: {
                        labels: [], // Will be populated
                        datasets: [
                            {
                                label: 'Hourly Revenue',
                                data: [],
                                backgroundColor: 'rgba(6, 182, 212, 0.7)',
                                borderColor: 'rgba(6, 182, 212, 1)',
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Cumulative Revenue',
                                data: [],
                                type: 'line',
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 2,
                                pointStyle: 'circle',
                                pointRadius: 0,
                                pointHoverRadius: 4,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time (Days)',
                                    color: textColor
                                },
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            },
                            y: {
                                type: 'linear',
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Hourly Revenue (SOL)',
                                    color: textColor
                                },
                                beginAtZero: true,
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            },
                            y1: {
                                type: 'linear',
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Cumulative Revenue (SOL)',
                                    color: textColor
                                },
                                beginAtZero: true,
                                grid: {
                                    drawOnChartArea: false
                                },
                                ticks: {
                                    color: textColor
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Revenue Analysis',
                                color: textColor
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.dataset.label;
                                        const value = context.parsed.y.toFixed(4);
                                        return label + ': ' + value + ' SOL';
                                    }
                                }
                            },
                            legend: {
                                position: 'top',
                                labels: {
                                    color: textColor
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'price':
            default:
                chartOptions = {
                    type: 'line',
                    data: {
                        labels: [], // Will be populated
                        datasets: [
                            {
                                label: 'Target Price',
                                data: [],
                                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                borderColor: 'rgba(99, 102, 241, 1)',
                                borderWidth: 2,
                                tension: 0.1
                            },
                            {
                                label: 'Actual Price',
                                data: [],
                                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                borderColor: 'rgba(6, 182, 212, 1)',
                                borderWidth: 2,
                                tension: 0.1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time (Days)',
                                    color: textColor
                                },
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Token Price (SOL)',
                                    color: textColor
                                },
                                beginAtZero: false,
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Token Price Over Time',
                                color: textColor
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': ' + context.parsed.y.toFixed(4) + ' SOL';
                                    }
                                }
                            },
                            legend: {
                                position: 'top',
                                labels: {
                                    color: textColor
                                }
                            }
                        }
                    }
                };
                break;
        }
        
        secondaryChart = new Chart(ctx, chartOptions);
        return secondaryChart;
    }
    
    // VRGDA price calculation function
    function calculateVRGDAPrice(targetPrice, decayRate, timeSinceStart, targetSaleTime) {
        // Calculate price using the VRGDA formula:
        // price = targetPrice * decay^(timeSinceStart - targetSaleTime)
        const exponent = timeSinceStart - targetSaleTime;
        return targetPrice * Math.pow(decayRate, exponent);
    }
    
    // Update the orderbook display
    function updateOrderbook(purchaseEvents) {
        // Clear existing entries
        while (buyOrders.children.length > 1) {
            buyOrders.removeChild(buyOrders.lastChild);
        }
        
        while (sellOrders.children.length > 1) {
            sellOrders.removeChild(sellOrders.lastChild);
        }
        
        if (purchaseEvents.length === 0) {
            const emptyMessageBuy = document.createElement('div');
            emptyMessageBuy.className = 'orderbook-entry empty';
            emptyMessageBuy.textContent = 'No buy orders yet';
            buyOrders.appendChild(emptyMessageBuy);
            
            const emptyMessageSell = document.createElement('div');
            emptyMessageSell.className = 'orderbook-entry empty';
            emptyMessageSell.textContent = 'No sell orders yet';
            sellOrders.appendChild(emptyMessageSell);
            return;
        }
        
        // Sort by price (highest first for buy orders)
        const sortedBuyEvents = [...purchaseEvents]
            .filter(event => event.type !== 'sell')
            .sort((a, b) => b.price - a.price);
            
        // Add some synthetic sell orders based on buy events
        const sellEvents = purchaseEvents
            .filter(event => event.type === 'sell' || Math.random() > 0.7)
            .map(event => {
                if (event.type === 'sell') return event;
                
                // Create a synthetic sell event with slightly higher price
                return {
                    time: event.time,
                    amount: Math.round(event.amount * (0.3 + Math.random() * 0.5)),
                    price: event.price * (1.05 + Math.random() * 0.1),
                    address: generateRandomAddress(),
                    type: 'sell'
                };
            })
            .sort((a, b) => a.price - b.price); // Sort by price (lowest first for sell orders)
        
        // Populate buy orders
        sortedBuyEvents.forEach(order => {
            const orderEntry = document.createElement('div');
            orderEntry.className = 'orderbook-entry';
            
            orderEntry.innerHTML = `
                <div class="price">${order.price.toFixed(4)} SOL</div>
                <div class="time">Day ${order.time.day}, Hr ${order.time.hour}</div>
                <div class="amount">${order.amount}</div>
            `;
            
            buyOrders.appendChild(orderEntry);
        });
        
        // Populate sell orders
        sellEvents.forEach(order => {
            const orderEntry = document.createElement('div');
            orderEntry.className = 'orderbook-entry';
            
            orderEntry.innerHTML = `
                <div class="price">${order.price.toFixed(4)} SOL</div>
                <div class="time">Day ${order.time.day}, Hr ${order.time.hour}</div>
                <div class="amount">${order.amount}</div>
            `;
            
            sellOrders.appendChild(orderEntry);
        });
    }
    
    // Generate simulation data
    function generateSimulationData() {
        const targetRate = parseFloat(targetRateInput.value);
        const initialPrice = parseFloat(initialPriceInput.value);
        const decayRate = parseFloat(decayRateInput.value);
        const salesVariation = parseFloat(salesVariationInput.value);
        totalDays = parseInt(simulationDaysInput.value);
        totalTokens = parseInt(totalTokensInput.value);
        
        // Calculate target sales rate per hour
        const targetRatePerHour = targetRate / hoursPerDay;
        
        // Prepare data
        const timeLabels = [];
        const targetPrices = [];
        const actualPrices = [];
        const tokensSoldByHour = [];
        const hourlyRevenue = [];
        const cumulativeRevenue = [];
        const cumulativeTargetSales = [];
        const cumulativeActualSales = [];
        const purchaseEvents = [];
        
        let totalTokensSold = 0;
        let totalRevenue = 0;
        
        // Create sales pattern based on active scenario
        // Make sure we get the scenario name if currentActiveScenario is a DOM element
        const scenarioName = typeof currentActiveScenario === 'string' 
            ? currentActiveScenario 
            : (currentActiveScenario && currentActiveScenario.id) 
                ? currentActiveScenario.id.replace('scenario-', '') 
                : 'normal';
        
        const salesPattern = getSalesPatternForScenario(scenarioName, totalDays, hoursPerDay, salesVariation);
        
        // Generate data for each hour
        for (let day = 0; day < totalDays; day++) {
            for (let hour = 0; hour < hoursPerDay; hour++) {
                const timeIndex = day * hoursPerDay + hour;
                const timeLabel = `${day + 1}.${hour}`;
                
                // For the target price, we assume tokens are sold exactly at the target rate
                const targetSaleTime = timeIndex; // 1:1 mapping in this simple model
                const targetPrice = calculateVRGDAPrice(initialPrice, decayRate, timeIndex, targetSaleTime);
                
                // Get sales variation factor for this hour from pattern
                const hourSalesVariation = salesPattern[timeIndex % salesPattern.length];
                
                let hourlyTokensSold;
                
                if (day === 0 && hour === 0) {
                    // First hour uses exact target rate
                    hourlyTokensSold = targetRatePerHour;
                } else {
                    // Add randomness to the sales rate
                    const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
                    hourlyTokensSold = targetRatePerHour * hourSalesVariation * randomFactor;
                    
                    // Ensure sales don't exceed total tokens
                    if (totalTokensSold + hourlyTokensSold > totalTokens) {
                        hourlyTokensSold = totalTokens - totalTokensSold;
                        if (hourlyTokensSold < 0) hourlyTokensSold = 0;
                    }
                }
                
                // Add purchase event with some randomness (not every hour)
                if (hourlyTokensSold > 0 && (Math.random() > 0.7 || (day < 2 && purchaseEvents.length < 3))) {
                    // Create a purchase event
                    const purchaseAmount = Math.round(hourlyTokensSold * (0.5 + Math.random()));
                    if (purchaseAmount > 0) {
                        const purchaseTime = {
                            day: day + 1,
                            hour: hour
                        };
                        
                        // Calculate actual price based on how far ahead/behind sales are
                        const salesProgress = totalTokensSold / ((day * hoursPerDay + hour) * targetRatePerHour + 0.001);
                        const adjustedTargetSaleTime = timeIndex / (salesProgress || 0.001); // Avoid division by zero
                        
                        const purchasePrice = calculateVRGDAPrice(
                            initialPrice, 
                            decayRate, 
                            timeIndex, 
                            adjustedTargetSaleTime
                        );
                        
                        purchaseEvents.push({
                            time: purchaseTime,
                            amount: purchaseAmount,
                            price: purchasePrice,
                            address: generateRandomAddress(),
                            type: 'buy'
                        });
                        
                        // Add a potential sell order at a slightly higher price
                        if (Math.random() > 0.7) {
                            purchaseEvents.push({
                                time: purchaseTime,
                                amount: Math.round(purchaseAmount * 0.3),
                                price: purchasePrice * 1.08,
                                address: generateRandomAddress(),
                                type: 'sell'
                            });
                        }
                    }
                }
                
                totalTokensSold += hourlyTokensSold;
                tokensSoldByHour.push(hourlyTokensSold);
                cumulativeTargetSales.push((day * hoursPerDay + hour + 1) * targetRatePerHour);
                cumulativeActualSales.push(totalTokensSold);
                
                // Calculate actual price based on how far ahead/behind sales are
                const salesProgress = totalTokensSold / ((day * hoursPerDay + hour + 1) * targetRatePerHour);
                const adjustedTargetSaleTime = timeIndex / (salesProgress || 0.001); // Avoid division by zero
                
                const actualPrice = calculateVRGDAPrice(initialPrice, decayRate, timeIndex, adjustedTargetSaleTime);
                
                // Calculate revenue
                const hourRevenue = hourlyTokensSold * actualPrice;
                totalRevenue += hourRevenue;
                
                timeLabels.push(timeLabel);
                targetPrices.push(targetPrice);
                actualPrices.push(actualPrice);
                hourlyRevenue.push(hourRevenue);
                cumulativeRevenue.push(totalRevenue);
            }
        }
        
        return {
            timeLabels,
            targetPrices,
            actualPrices,
            tokensSoldByHour,
            hourlyRevenue,
            cumulativeRevenue,
            cumulativeTargetSales,
            cumulativeActualSales,
            purchaseEvents,
            totalTokensSold,
            totalRevenue
        };
    }
    
    // Get sales pattern based on the selected scenario
    function getSalesPatternForScenario(scenarioName, days, hoursPerDay, baseVariation) {
        const pattern = [];
        const totalHours = days * hoursPerDay;
        
        switch (scenarioName) {
            case 'slow':
                // Start slow, gradually pick up
                for (let i = 0; i < totalHours; i++) {
                    const dayProgress = i / totalHours;
                    // Start at 0.3x baseline, gradually increase to 1.2x
                    pattern.push(baseVariation * (0.3 + dayProgress * 0.9));
                }
                break;
                
            case 'fast':
                // Start fast, gradually slow down
                for (let i = 0; i < totalHours; i++) {
                    const dayProgress = i / totalHours;
                    // Start at 2x baseline, gradually decrease to 0.8x
                    pattern.push(baseVariation * (2.0 - dayProgress * 1.2));
                }
                break;
                
            case 'volatile':
                // Alternating periods of high and low demand
                for (let i = 0; i < totalHours; i++) {
                    const dayIndex = Math.floor(i / hoursPerDay);
                    const hourInDay = i % hoursPerDay;
                    
                    if (dayIndex % 2 === 0) {
                        // Even days: higher sales in morning, lower in evening
                        if (hourInDay < 12) {
                            pattern.push(baseVariation * 1.8); // High morning demand
                        } else {
                            pattern.push(baseVariation * 0.4); // Low evening demand
                        }
                    } else {
                        // Odd days: lower sales in morning, higher in evening
                        if (hourInDay < 12) {
                            pattern.push(baseVariation * 0.5); // Low morning demand
                        } else {
                            pattern.push(baseVariation * 1.5); // High evening demand
                        }
                    }
                }
                break;
                
            case 'longterm':
                // Long-term pattern with different phases
                const phaseDuration = Math.floor(totalHours / 5);
                
                for (let i = 0; i < totalHours; i++) {
                    const phase = Math.floor(i / phaseDuration);
                    
                    switch (phase) {
                        case 0: // Initial high interest
                            pattern.push(baseVariation * 1.7);
                            break;
                        case 1: // Cooling down
                            pattern.push(baseVariation * 0.8);
                            break;
                        case 2: // Stable period
                            pattern.push(baseVariation * 1.0);
                            break;
                        case 3: // Renewed interest
                            pattern.push(baseVariation * 1.5);
                            break;
                        default: // Final phase
                            pattern.push(baseVariation * 0.7);
                            break;
                    }
                }
                break;
                
            case 'normal':
            case 'custom':
            default:
                // Normal pattern with slight randomization
                for (let i = 0; i < totalHours; i++) {
                    // Add slight sine wave variation to create natural rhythm
                    const sineVariation = 0.2 * Math.sin(i / 24 * Math.PI);
                    pattern.push(baseVariation * (1 + sineVariation));
                }
                break;
        }
        
        return pattern;
    }
    
    // Update chart with simulation data
    function updateCharts(data, animate = true) {
        updatePriceChart(data, animate);
        updateSecondaryChart(data, animate);
    }
    
    // Update primary price chart
    function updatePriceChart(data, animate = true) {
        // Filter data to reduce points (every 4 hours)
        const filterInterval = Math.max(1, Math.floor(data.timeLabels.length / 100)); // Ensure we don't have too many points
        const filteredLabels = data.timeLabels.filter((_, i) => i % filterInterval === 0);
        const filteredTargetPrices = data.targetPrices.filter((_, i) => i % filterInterval === 0);
        const filteredActualPrices = data.actualPrices.filter((_, i) => i % filterInterval === 0);
        
        // Convert time labels to readable format (Day 1, Day 2, etc.)
        const readableLabels = filteredLabels.map(label => {
            const [day, hour] = label.split('.');
            if (hour === '0') {
                return `Day ${day}`;
            } else if (hour === '12') {
                return `Day ${day} (Noon)`;
            }
            return '';
        });
        
        // Update chart data
        priceChart.data.labels = readableLabels;
        priceChart.data.datasets[0].data = filteredTargetPrices;
        priceChart.data.datasets[1].data = filteredActualPrices;
        
        // Add purchase markers
        if (animate) {
            priceChart.update();
            
            // Clear previous purchase markers
            document.querySelectorAll('.purchase-marker').forEach(marker => marker.remove());
            
            // Add purchase markers with delay
            setTimeout(() => {
                data.purchaseEvents.forEach((purchase, index) => {
                    setTimeout(() => {
                        addPurchaseMarker(purchase);
                    }, index * 300);
                });
            }, 1000);
        } else {
            priceChart.update('none');
        }
    }
    
    // Update secondary chart
    function updateSecondaryChart(data, animate = true) {
        if (!secondaryChart) {
            initSecondaryChart(activeChartType);
        }
        
        // Filter data to reduce points
        const filterInterval = Math.max(1, Math.floor(data.timeLabels.length / 100));
        const filteredLabels = data.timeLabels.filter((_, i) => i % filterInterval === 0);
        
        // Convert time labels to readable format (Day 1, Day 2, etc.)
        const readableLabels = filteredLabels.map(label => {
            const [day, hour] = label.split('.');
            if (hour === '0') {
                return `Day ${day}`;
            } else if (hour === '12') {
                return `Day ${day} (Noon)`;
            }
            return '';
        });
        
        // Update labels
        secondaryChart.data.labels = readableLabels;
        
        // Update datasets based on chart type
        switch (activeChartType) {
            case 'sales':
                // Filter hourly sales data
                const filteredTargetSales = Array(filteredLabels.length).fill(data.cumulativeTargetSales[0] / 24); // Flat target line
                const filteredActualSales = data.tokensSoldByHour.filter((_, i) => i % filterInterval === 0);
                
                secondaryChart.data.datasets[0].data = filteredTargetSales;
                secondaryChart.data.datasets[1].data = filteredActualSales;
                break;
                
            case 'cumulative':
                // Filter cumulative sales data
                const filteredCumulativeTargetSales = data.cumulativeTargetSales.filter((_, i) => i % filterInterval === 0);
                const filteredCumulativeActualSales = data.cumulativeActualSales.filter((_, i) => i % filterInterval === 0);
                
                secondaryChart.data.datasets[0].data = filteredCumulativeTargetSales;
                secondaryChart.data.datasets[1].data = filteredCumulativeActualSales;
                break;
                
            case 'revenue':
                // Filter revenue data
                const filteredHourlyRevenue = data.hourlyRevenue.filter((_, i) => i % filterInterval === 0);
                const filteredCumulativeRevenue = data.cumulativeRevenue.filter((_, i) => i % filterInterval === 0);
                
                secondaryChart.data.datasets[0].data = filteredHourlyRevenue;
                secondaryChart.data.datasets[1].data = filteredCumulativeRevenue;
                break;
                
            case 'price':
            default:
                // Filter price data (same as primary chart)
                const filteredTargetPrices = data.targetPrices.filter((_, i) => i % filterInterval === 0);
                const filteredActualPrices = data.actualPrices.filter((_, i) => i % filterInterval === 0);
                
                // Make sure we have two datasets for the price chart
                if (secondaryChart.data.datasets.length < 2) {
                    secondaryChart.data.datasets = [
                        {
                            label: 'Target Price',
                            data: [],
                            backgroundColor: 'rgba(99, 102, 241, 0.2)', 
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        },
                        {
                            label: 'Actual Price',
                            data: [],
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            borderColor: 'rgba(6, 182, 212, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }
                    ];
                }
                
                secondaryChart.data.datasets[0].data = filteredTargetPrices;
                secondaryChart.data.datasets[1].data = filteredActualPrices;
                break;
        }
        
        // Update chart with animation
        if (animate) {
            secondaryChart.update();
        } else {
            secondaryChart.update('none');
        }
    }
    
    // Add purchase marker on the chart
    function addPurchaseMarker(purchase) {
        const timeIndex = (purchase.time.day - 1) * hoursPerDay + purchase.time.hour;
        const filterInterval = Math.max(1, Math.floor(simulationData.timeLabels.length / 100));
        const dataIndex = Math.floor(timeIndex / filterInterval);
        
        // Get position on chart
        const chart = priceChart;
        const meta = chart.getDatasetMeta(1); // Actual price dataset
        
        if (meta.data[dataIndex]) {
            const x = meta.data[dataIndex].x;
            const y = meta.data[dataIndex].y;
            
            // Create marker element
            const marker = document.createElement('div');
            marker.className = 'purchase-marker';
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            marker.title = `${purchase.amount} tokens purchased at ${purchase.price.toFixed(4)} SOL`;
            
            // Show tooltip on hover
            marker.addEventListener('mouseenter', () => {
                showTooltip(marker, `${purchase.amount} tokens purchased at ${purchase.price.toFixed(4)} SOL`);
            });
            
            marker.addEventListener('mouseleave', () => {
                hideTooltip();
            });
            
            document.querySelector('.chart-container').appendChild(marker);
            
            // Show price tick
            showPriceTick(x, y, purchase.price);
        }
    }
    
    // Show a price tick on the chart
    function showPriceTick(x, y, price) {
        const tick = document.createElement('div');
        tick.className = 'price-tick';
        tick.textContent = `${price.toFixed(4)} SOL`;
        tick.style.left = `${x}px`;
        tick.style.top = `${y - 25}px`;
        
        document.querySelector('.chart-container').appendChild(tick);
        
        // Remove after animation
        setTimeout(() => {
            tick.remove();
        }, 2000);
    }
    
    // Show tooltip
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.zIndex = '100';
        tooltip.style.pointerEvents = 'none';
        
        const rect = element.getBoundingClientRect();
        const chartContainer = document.querySelector('.chart-container');
        const containerRect = chartContainer.getBoundingClientRect();
        
        tooltip.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - containerRect.top - 30}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        chartContainer.appendChild(tooltip);
    }
    
    // Hide tooltip
    function hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    // Generate a random Solana-like address
    function generateRandomAddress() {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
        let address = '';
        for (let i = 0; i < 44; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Show shortened version (first 4 + ... + last 4)
        return address.substring(0, 4) + '...' + address.substring(40, 44);
    }
    
    // Update status display
    function updateStatusDisplay(data) {
        // Last index contains final values
        const lastIndex = data.timeLabels.length - 1;
        
        currentDayElement.textContent = `${totalDays} of ${totalDays}`;
        currentPriceElement.textContent = `${data.actualPrices[lastIndex].toFixed(4)} SOL`;
        
        const totalTokensSold = data.cumulativeActualSales[lastIndex];
        const percentageSold = (totalTokensSold / totalTokens * 100).toFixed(1);
        tokensSoldElement.textContent = `${Math.round(totalTokensSold).toLocaleString()} (${percentageSold}%)`;
        
        const targetSalesPerDay = parseFloat(targetRateInput.value);
        targetSalesElement.textContent = `${targetSalesPerDay.toLocaleString()} (Day ${totalDays})`;
        
        const actualSalesLastDay = data.cumulativeActualSales[lastIndex] - 
            (lastIndex - hoursPerDay >= 0 ? data.cumulativeActualSales[lastIndex - hoursPerDay] : 0);
        const percentageOfTarget = (actualSalesLastDay / targetSalesPerDay * 100).toFixed(1);
        actualSalesElement.textContent = `${Math.round(actualSalesLastDay).toLocaleString()} (${percentageOfTarget}%)`;
    }
    
    // Run the simulation with animation
    function runSimulation() {
        // Generate new simulation data
        simulationData = generateSimulationData();
        
        // Initialize chart if needed
        if (!priceChart) {
            initPrimaryChart();
        }
        
        if (!secondaryChart) {
            initSecondaryChart(activeChartType);
        }
        
        // Update charts with animation
        updateCharts(simulationData, true);
        
        // Update orderbook display
        updateOrderbook(simulationData.purchaseEvents);
        
        // Update status display
        updateStatusDisplay(simulationData);
        
        // Animate status values
        animateStatusValues(simulationData);
        
        return simulationData;
    }
    
    // Animate status values during simulation
    function animateStatusValues(data) {
        // Animation duration in ms
        const duration = 2000;
        const fps = 30;
        const frames = duration / (1000 / fps);
        
        // Last index contains final values
        const lastIndex = data.timeLabels.length - 1;
        
        // Initial values
        const initialPrice = parseFloat(initialPriceInput.value);
        const initialTokensSold = 0;
        
        // Final values
        const finalPrice = data.actualPrices[lastIndex];
        const finalTokensSold = data.cumulativeActualSales[lastIndex];
        
        // Calculate increments per frame
        const priceIncrement = (finalPrice - initialPrice) / frames;
        const tokensSoldIncrement = finalTokensSold / frames;
        
        // Current values
        let currentFrame = 0;
        let currentPrice = initialPrice;
        let currentTokensSold = initialTokensSold;
        
        // Update function
        function update() {
            currentFrame++;
            
            if (currentFrame <= frames) {
                // Update current values
                currentPrice += priceIncrement;
                currentTokensSold += tokensSoldIncrement;
                
                // Update display
                currentPriceElement.textContent = `${currentPrice.toFixed(4)} SOL`;
                
                const percentageSold = (currentTokensSold / totalTokens * 100).toFixed(1);
                tokensSoldElement.textContent = `${Math.round(currentTokensSold).toLocaleString()} (${percentageSold}%)`;
                
                // Continue animation
                requestAnimationFrame(update);
            }
        }
        
        // Start animation
        update();
    }
    
    // Initialize scenario cards
    function initScenarios() {
        // Add click handlers to scenario cards
        const scenarioCards = document.querySelectorAll('.scenario-card');
        scenarioCards.forEach(card => {
            card.addEventListener('click', function() {
                setActiveScenario(this);
                loadScenarioSettings(this.id);
            });
        });
        
        // Set default scenario
        setActiveScenario(scenarioNormal);
        loadScenarioSettings('scenario-normal');
    }
    
    // Set active scenario
    function setActiveScenario(scenarioElement) {
        // Remove active class from all scenarios
        const scenarioCards = document.querySelectorAll('.scenario-card');
        scenarioCards.forEach(card => card.classList.remove('active'));
        
        // Add active class to selected scenario
        scenarioElement.classList.add('active');
        currentActiveScenario = scenarioElement;
    }
    
    // Load a predefined scenario
    function loadScenarioSettings(scenarioId) {
        // Extract the actual scenario name from the ID
        let scenarioName = scenarioId.replace('scenario-', '');
        
        // Reset custom inputs based on the scenario
        switch (scenarioName) {
            case 'normal':
                targetRateInput.value = 10000;
                initialPriceInput.value = 0.1;
                decayRateInput.value = 0.9;
                salesVariationInput.value = 1.0;
                simulationDaysInput.value = 7;
                totalTokensInput.value = 70000;
                break;
                
            case 'slow':
                targetRateInput.value = 10000;
                initialPriceInput.value = 0.1;
                decayRateInput.value = 0.85;
                salesVariationInput.value = 0.5;
                simulationDaysInput.value = 7;
                totalTokensInput.value = 70000;
                break;
                
            case 'fast':
                targetRateInput.value = 10000;
                initialPriceInput.value = 0.1;
                decayRateInput.value = 0.95;
                salesVariationInput.value = 1.8;
                simulationDaysInput.value = 7;
                totalTokensInput.value = 70000;
                break;
                
            case 'volatile':
                targetRateInput.value = 10000;
                initialPriceInput.value = 0.1;
                decayRateInput.value = 0.88;
                salesVariationInput.value = 1.0;  // Base value - variation applied in pattern
                simulationDaysInput.value = 7;
                totalTokensInput.value = 70000;
                break;
                
            case 'longterm':
                targetRateInput.value = 5000;
                initialPriceInput.value = 0.05;
                decayRateInput.value = 0.92;
                salesVariationInput.value = 1.0;
                simulationDaysInput.value = 30;
                totalTokensInput.value = 150000;
                break;
                
            case 'custom':
                // Custom scenario, don't change inputs
                break;
        }
        
        // Set the currentActiveScenario to the scenario name for use in getSalesPatternForScenario
        currentActiveScenario = scenarioName;
        
        // Run simulation with new settings
        simulationData = runSimulation();
        updatePrimaryChart(simulationData);
        updateSecondaryChart(simulationData);
    }
    
    // Event listeners
    runSimulationBtn.addEventListener('click', function() {
        // Run the simulation
        simulationData = runSimulation();
        
        // Update the charts
        updatePrimaryChart(simulationData);
        updateSecondaryChart(simulationData);
        
        // If no scenario is selected, set to custom
        if (!currentActiveScenario) {
            setActiveScenario(scenarioCustom);
            currentActiveScenario = 'custom';
        }
    });
    
    // Scenario button event listeners
    scenarioNormal.addEventListener('click', function() {
        // No need to do anything else as setActiveScenario and loadScenarioSettings
        // will be called by the click handler in initScenarios
    });
    
    scenarioSlow.addEventListener('click', function() {
        // No need to do anything else as setActiveScenario and loadScenarioSettings
        // will be called by the click handler in initScenarios
    });
    
    scenarioFast.addEventListener('click', function() {
        // No need to do anything else as setActiveScenario and loadScenarioSettings
        // will be called by the click handler in initScenarios
    });
    
    scenarioVolatile.addEventListener('click', function() {
        // No need to do anything else as setActiveScenario and loadScenarioSettings
        // will be called by the click handler in initScenarios
    });
    
    scenarioLongterm.addEventListener('click', function() {
        // No need to do anything else as setActiveScenario and loadScenarioSettings
        // will be called by the click handler in initScenarios
    });
    
    scenarioCustom.addEventListener('click', function() {
        // No need to do anything else as setActiveScenario and loadScenarioSettings
        // will be called by the click handler in initScenarios
    });
    
    // Chart tab event listeners
    chartTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            activeChartType = this.getAttribute('data-chart');
            
            // Update active tab
            chartTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Reinitialize chart with new type
            initSecondaryChart(activeChartType);
            
            // Update chart with data if simulation has been run
            if (simulationData) {
                updateSecondaryChart(simulationData);
            }
        });
    });
    
    // Input field event listeners to mark as custom scenario when parameters are changed
    const inputFields = [targetRateInput, initialPriceInput, decayRateInput, salesVariationInput, simulationDaysInput, totalTokensInput];
    inputFields.forEach(input => {
        input.addEventListener('change', function() {
            setActiveScenario(scenarioCustom);
            currentActiveScenario = 'custom';
        });
    });
    
    // Initialize the simulator
    function initSimulator() {
        // Set the initial active chart type
        activeChartType = 'price';
        
        // Set the active tab
        document.querySelector('.chart-tab[data-chart="price"]').classList.add('active');
        
        // Initialize charts with initial theme
        initPrimaryChart();
        initSecondaryChart(activeChartType);
        
        // Initialize scenarios
        initScenarios();
        
        // Run initial simulation
        simulationData = runSimulation();
    }
    
    // Run the simulator initialization
    initSimulator();
}); 