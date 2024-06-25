let chart; // グラフのインスタンスを保持する変数
let timeDomainChart;
let frequencySpectrumChart;
let reconstructedSignalChart;

// インタラクティブグラフを更新する関数
function updateGraph() {
    const frequency = document.getElementById('frequencyRange').value;
    document.getElementById('frequencyValue').textContent = frequency;

    const labels = [];
    const data = [];

    for (let i = 0; i < 100; i++) {
        labels.push(i);
        data.push(Math.sin(2 * Math.PI * frequency * i / 100));
    }

    const ctx = document.getElementById('interactiveGraph').getContext('2d');

    if (chart) {
        chart.destroy(); // 既存のチャートを破棄
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '正弦波',
                data: data,
                borderColor: 'blue',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '時間 (サンプル番号)'
                    },
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: '振幅'
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateGraph();
});

function generateCompositeWave() {
    const frequencies = document.getElementById('frequencies').value.split(',').map(Number);
    const amplitudes = document.getElementById('amplitudes').value.split(',').map(Number);
    const phases = document.getElementById('phases').value.split(',').map(Number);

    if (frequencies.length !== amplitudes.length || frequencies.length !== phases.length) {
        alert("周波数、振幅、位相の数が一致している必要があります。");
        return;
    }

    const N = 100; // サンプル数
    const labels = Array.from({ length: N }, (_, i) => i);
    const data = new Array(N).fill(0);

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < frequencies.length; j++) {
            data[i] += amplitudes[j] * Math.sin(2 * Math.PI * frequencies[j] * i / N + phases[j]);
        }
    }

    const ctx = document.getElementById('timeDomainChart').getContext('2d');
    if (timeDomainChart) {
        timeDomainChart.destroy(); // 既存のチャートを破棄
    }

    timeDomainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '合成波',
                data: data,
                borderColor: 'red',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '時間 (サンプル番号)'
                    },
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: '振幅'
                    }
                }
            }
        }
    });

    calculateDFT(data);
}

function calculateDFT(input) {
    if (!input) {
        alert("入力データがありません。");
        return;
    }

    const N = input.length;
    const X = new Array(N).fill(0).map(() => [0, 0]); // DFT結果の配列（複素数）

    // DFT計算
    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            const angle = -2 * Math.PI * k * n / N;
            X[k][0] += input[n] * Math.cos(angle); // 実部
            X[k][1] += input[n] * Math.sin(angle); // 虚部
        }
    }

    // 計算過程の表示
    const stepsContainer = document.getElementById('dft-steps');
    stepsContainer.innerHTML = X.map((value, index) => `X[${index}] = ${value[0].toFixed(2)} + ${value[1].toFixed(2)}i`).join('<br>');

    // 周波数スペクトルの表示
    const magnitude = X.map(c => Math.sqrt(c[0] ** 2 + c[1] ** 2));
    const frequencyLabels = Array.from({ length: N }, (_, i) => i);

    const freqCtx = document.getElementById('frequencySpectrum').getContext('2d');
    if (frequencySpectrumChart) {
        frequencySpectrumChart.destroy(); // 既存のチャートを破棄
    }

    frequencySpectrumChart = new Chart(freqCtx, {
        type: 'bar',
        data: {
            labels: frequencyLabels,
            datasets: [{
                label: '周波数スペクトル',
                data: magnitude,
                backgroundColor: 'blue'
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '周波数 (インデックス)'
                    },
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: '振幅'
                    }
                }
            }
        }
    });

    // 信号再構成の表示
    const reconstructed = new Array(N).fill(0);
    for (let n = 0; n < N; n++) {
        for (let k = 0; k < N; k++) {
            const angle = 2 * Math.PI * k * n / N;
            reconstructed[n] += X[k][0] * Math.cos(angle) - X[k][1] * Math.sin(angle);
        }
        reconstructed[n] /= N;
    }

    const reconCtx = document.getElementById('reconstructedSignal').getContext('2d');
    if (reconstructedSignalChart) {
        reconstructedSignalChart.destroy(); // 既存のチャートを破棄
    }

    reconstructedSignalChart = new Chart(reconCtx, {
        type: 'line',
        data: {
            labels: frequencyLabels,
            datasets: [{
                label: '再構成された信号',
                data: reconstructed,
                borderColor: 'green',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '時間 (サンプル番号)'
                    },
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    title: {
                        display: true,
                        text: '振幅'
                    }
                }
            }
        }
    });
}
