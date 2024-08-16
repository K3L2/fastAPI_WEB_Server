$(document).ready(function() {
    
    getTodayDefects();
    getTodayProductDefects();

});

// getTodayProductDefects
function getTodayProductDefects() {

    // 수정 해야할 부분
    const defect_url = 'https://api.npoint.io/ca4945292edaf352b591'
    // const defect_url = 'http://13.125.18.156:8080/dashboard/getTodayDefects/products'

    $.ajax({
        url: defect_url, // 요청을 보낼 URI
        type: 'GET',
        dataType: 'json', // 반환받는 데이터의 타입을 JSON으로 지정
        success: function(data) {
            console.log('금일 불량 제품 수');
            console.log(data);

            const chartData = getGaugeChartData(data);
            
            console.log(chartData);

            plotGaugeChart(chartData);

        },
        error: function(jqXHR, textStatus, errorThrown) {
            // 요청이 실패했을 때 실행할 코드
            console.error('AJAX 요청 실패:', textStatus, errorThrown);
        }
    });

}



// getTodayDefects
function getTodayDefects() {

    // 수정 해야할 부분
    const today_defects_URL = 'https://api.npoint.io/833be13968fdbe705dd9'
    // const todayDefect = 'http://13.125.18.156:8080/dashboard/getTodayDefects'
    // 오늘 전체 불량 개수 (pie Chart를 위함)
    $.ajax({
        type: 'GET',
        url: today_defects_URL, // 요청을 보낼 URI
        // dataType: 'json', // 반환받는 데이터의 타입을 JSON으로 지정
        success: function(data) {
            
            console.log(data);

            sortedData = processRankData(data);

            const chartData = sortedData.map(item => ({
                value: item.value,
                name: getErrorType(item.category)
            }));

            const order = ['패턴 불량', '잉크 불량', '금도금 불량', '스크래치'];

            // 객체 배열을 정렬
            chartData.sort((a, b) => {
                return order.indexOf(a.name) - order.indexOf(b.name);
            });
            // console.log(chartData)
            plotPieChart(chartData)

            

            // Bar Chart Plot 하기 위한 데이터 사전 작업

            const total = Object.values(data).reduce((sum, value) => sum + value, 0);

            let defectDataArray = [];

            const orderedKeys = ["pattern", "ink", "au", "scratch"];

            orderedKeys.forEach(key => {
                defectDataArray.push(data[key]);
            });

            let barChartData = {
                'total' : total,
                'errorCount' : defectDataArray
            }

            plotBarChart(barChartData)

        },
        error: function(jqXHR, textStatus, errorThrown) {
            // 요청이 실패했을 때 실행할 코드
            console.error('AJAX 요청 실패:', textStatus, errorThrown);
        }
    });
}


function getGaugeChartData(data) {

    // {
    //     "au_product": 110,
    //     "ink_product": 90,
    //     "total_product": 10000,
    //     "pattern_product": 170,
    //     "scratch_product": 130
    //  }

    const totalProductCount = data['total_product'];

    let defectProductDataArray = []

    const orderedKeys = ["pattern_product", "ink_product", "au_product", "scratch_product"];

    orderedKeys.forEach(key => {
        defectProductDataArray.push(data[key]);
    });

    // console.log(defectProductDataArray);

    const totalDefectCount = defectProductDataArray.reduce((sum, value) => sum + value, 0)

    // console.log(totalDefectCount);

    // processState = (1 - (data[]))

    let errorProductRateArray = []

    defectProductDataArray.forEach((item) => {
        // item : defectProduct 개수가 들어옴

        const defectRate = (item / totalProductCount);
        let temp = 1 - defectRate;
        let defectGrade = Number.parseFloat(temp * 100).toFixed(2);

        errorProductRateArray.push(defectGrade);
    });

    // console.log(errorProductRateArray);

    /*

        chartData = {
            'totalProductData' : gaugeData(1 - (errorProduct / total))
            'errorProductData' : [1 - (pattern / total)]
        }

    */
    const processStateGrade = Number.parseFloat((1 - (totalDefectCount / totalProductCount)) * 100).toFixed(2);
    
    // console.log(processStateGrade);

    const chartData = {
        'totalProductData' : processStateGrade,
        'errorProductData' : errorProductRateArray
    }

    return chartData;
}


function plotGaugeChart(chartData) {

    const GAUGE_WIDTH = 15;
    const TICK_DISTANCE = -10;
    const LABEL_DISTANCE = 25;
    const COLOR_BAD = '#eb3d34';
    const COLOR_WARNING = '#fca903';
    const COLOR_GOOD = '#1fde29';

    let errorGaugeData = chartData['errorProductData'];

    let stateGaugeData = chartData['totalProductData'];

    console.log(errorGaugeData);
    console.log(stateGaugeData);

    var patternChartDom = document.getElementById('patternGaugeChart');
    var patternGaugeChart = echarts.init(patternChartDom);
    patternOption = {
        series: [
        {
            type: 'gauge',
            axisLine: {
            lineStyle: {
                width: GAUGE_WIDTH,
                color: [
                [0.8, COLOR_BAD],
                [0.9, COLOR_WARNING],
                [1, COLOR_GOOD]
                ]
            }
            },
            pointer: {
            itemStyle: {
                color: 'auto'
            }
            },
            axisTick: {
            distance: TICK_DISTANCE,
            length: 8,
            lineStyle: {
                color: '#fff',
                width: 2
            }
            },
            splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
                color: '#fff',
                width: 4
            }
            },
            axisLabel: {
            color: 'inherit',
            distance: LABEL_DISTANCE,
            fontSize: 15
            },
            detail: {
            valueAnimation: true,
            formatter: '{value}점',
            color: 'inherit',
            fontSize: 14
            },
            data: [
            {
                value: errorGaugeData[0]
            }
            ]
        }
        ]
    };
    patternGaugeChart.setOption(patternOption);


    // Ink Gauge Chart

    var inkChartDom = document.getElementById('inkGaugeChart');
    var inkGaugeChart = echarts.init(inkChartDom);
    inkOption = {
        series: [
        {
            type: 'gauge',
            axisLine: {
            lineStyle: {
                width: GAUGE_WIDTH,
                color: [
                [0.8, COLOR_BAD],
                [0.9, COLOR_WARNING],
                [1, COLOR_GOOD]
                ]
            }
            },
            pointer: {
            itemStyle: {
                color: 'auto'
            }
            },
            axisTick: {
            distance: TICK_DISTANCE,
            length: 8,
            lineStyle: {
                color: '#fff',
                width: 2
            }
            },
            splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
                color: '#fff',
                width: 4
            }
            },
            axisLabel: {
            color: 'inherit',
            distance: LABEL_DISTANCE,
            fontSize: 15
            },
            detail: {
            valueAnimation: true,
            formatter: '{value}점',
            color: 'inherit',
            fontSize: 14
            },
            data: [
            {
                value: errorGaugeData[1]
            }
            ]
        }
        ]
    };

    inkGaugeChart.setOption(inkOption);



    // Au Gauge Chart

    var auChartDom = document.getElementById('auGaugeChart');
    var auGaugeChart = echarts.init(auChartDom);
    auOption = {
        series: [
        {
            type: 'gauge',
            axisLine: {
            lineStyle: {
                width: GAUGE_WIDTH,
                color: [
                [0.8, COLOR_BAD],
                [0.9, COLOR_WARNING],
                [1, COLOR_GOOD]
                ]
            }
            },
            pointer: {
            itemStyle: {
                color: 'auto'
            }
            },
            axisTick: {
            distance: TICK_DISTANCE,
            length: 8,
            lineStyle: {
                color: '#fff',
                width: 2
            }
            },
            splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
                color: '#fff',
                width: 4
            }
            },
            axisLabel: {
            color: 'inherit',
            distance: LABEL_DISTANCE,
            fontSize: 15
            },
            detail: {
            valueAnimation: true,
            formatter: '{value}점',
            color: 'inherit',
            fontSize: 14
            },
            data: [
            {
                value: errorGaugeData[2]
            }
            ]
        }
        ]
    };

    auGaugeChart.setOption(auOption);



    // Scratch Gauge Chart

    var scratchChartDom = document.getElementById('scratchGaugeChart');
    var scratchGaugeChart = echarts.init(scratchChartDom);
    scratchOption = {
        series: [
        {
            type: 'gauge',
            axisLine: {
            lineStyle: {
                width: GAUGE_WIDTH,
                color: [
                [0.8, COLOR_BAD],
                [0.9, COLOR_WARNING],
                [1, COLOR_GOOD]
                ]
            }
            },
            pointer: {
            itemStyle: {
                color: 'auto'
            }
            },
            axisTick: {
            distance: TICK_DISTANCE,
            length: 8,
            lineStyle: {
                color: '#fff',
                width: 2
            }
            },
            splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
                color: '#fff',
                width: 4
            }
            },
            axisLabel: {
            color: 'inherit',
            distance: LABEL_DISTANCE,
            fontSize: 15
            },
            detail: {
            valueAnimation: true,
            formatter: '{value}점',
            color: 'inherit',
            fontSize: 14
            },
            data: [
            {
                value: errorGaugeData[3]
            }
            ]
        }
        ]
    };
    scratchGaugeChart.setOption(scratchOption);

    // Pattern Gauge Chart

    var stateChartDom = document.getElementById('stateGaugeChart');
    var stateGaugeChart = echarts.init(stateChartDom);
    stateOption = {
        series: [
        {
            type: 'gauge',
            axisLine: {
            lineStyle: {
                width: GAUGE_WIDTH,
                color: [
                [0.8, COLOR_BAD],
                [0.9, COLOR_WARNING],
                [1, COLOR_GOOD]
                ]
            }
            },
            pointer: {
            itemStyle: {
                color: 'auto'
            }
            },
            axisTick: {
            distance: TICK_DISTANCE,
            length: 8,
            lineStyle: {
                color: '#fff',
                width: 2
            }
            },
            splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
                color: '#fff',
                width: 4
            }
            },
            axisLabel: {
            color: 'inherit',
            distance: LABEL_DISTANCE,
            fontSize: 15
            },
            detail: {
            valueAnimation: true,
            formatter: '{value}점',
            color: 'inherit',
            fontSize: 14
            },
            data: [
            {
                value: stateGaugeData
            }
            ]
        }
        ]
    };
    stateGaugeChart.setOption(stateOption);




    setInterval(function () {
        patternGaugeChart.setOption({
        series: [
            {
            data: [
                {
                value: +(Math.random() * 100).toFixed()
                }
            ]
            }
        ]
        });
        inkGaugeChart.setOption({
            series: [
            {
                data: [
                {
                    value: +(Math.random() * 100).toFixed()
                }
                ]
            }
            ]
        });
        auGaugeChart.setOption({
            series: [
            {
                data: [
                {
                    value: +(Math.random() * 100).toFixed()
                }
                ]
            }
            ]
        });
        scratchGaugeChart.setOption({
            series: [
            {
                data: [
                {
                    value: +(Math.random() * 100).toFixed()
                }
                ]
            }
            ]
        });
        stateGaugeChart.setOption({
            series: [
            {
                data: [
                {
                    value: +(Math.random() * 100).toFixed()
                }
                ]
            }
            ]
        });
    }, 5000);

}

// 에러 유형을 사람이 읽을 수 있는 이름으로 변환
function getErrorType(error) {
    switch (error) {
        case 'pattern':
            return '패턴 불량';
        case 'ink':
            return '잉크 불량';
        case 'au':
            return '금도금 불량';
        case 'scratch':
            return '스크래치';
        default:
            return '알 수 없음';
    }
  }


//  PieChart Plot용 함수

function plotPieChart(chartData) {
    
    var piChartDom = document.getElementById('defectPiChart');
    var piChart = echarts.init(piChartDom);
    var piChartOption = {
        title: {
            // text: '이번 주차 불량 비율'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: '불량 종류',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: chartData
            }
        ]
    };
    piChart.setOption(piChartOption);
}



// 입력 받은 data 처리용 함수

function processRankData(data) {
    // 모든 값의 총합 계산

    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    // 객체를 배열로 변환 후 값에 따라 내림차순으로 정렬
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

    // 비율 계산 및 배열을 객체 형태로 변환하여 반환
    return sortedData.map(([category, value]) => ({
        category,
        value,
        proportion: ((value / total) * 100).toFixed(1) // 백분율 계산 후 소수점 1자리로 포맷
    }));
}




// BarChart Plot

function plotBarChart(chartData) {

    console.log(chartData)

    const total = chartData['total']
    const errorCount = chartData['errorCount']

    const barColor = '#1b369e'

    // pattern Bar Chart

    var patternBarChartDom = document.getElementById('patternBarChart');
    var patternBarChart = echarts.init(patternBarChartDom);

    patternBarChartOption = {
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
        },
        xAxis: {
        type: 'category',
        data: ['패턴 불량 수']
        },
        yAxis: [
            {
            type: 'value',
            name: 'TotalDefects', 
            min: 0,
            max: total, // 변수로 해서 추가하면 됨 # ex) totalDefects = 100 
            show: false
            }
        ],
        series: [
        {
            data: [errorCount[0]],
            type: 'bar',
            showBackground: true,
            emphasis: {
            focus: 'series'
            },
            backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.6)'
            },
            barWidth: '20%',
            itemStyle:{
            color: barColor,
            },
        }
        ]
    };

    patternBarChart.setOption(patternBarChartOption);

    // ink Bar Chart

    var inkBarChartDom = document.getElementById('inkBarChart');
    var inkBarChart = echarts.init(inkBarChartDom);

    inkBarChartOption = {
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
        },
        xAxis: {
        type: 'category',
        data: ['잉크 불량 수']
        },
        yAxis: [
            {
            type: 'value',
            name: 'TotalDefects', 
            min: 0,
            max: total, // 변수로 해서 추가하면 됨 # ex) totalDefects = 100 
            show: false
            }
        ],
        series: [
        {
            data: [errorCount[1]],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.6)'
            },
            barWidth: '20%',
            itemStyle:{
            color: barColor,
            },
        }
        ]
    };

    inkBarChart.setOption(inkBarChartOption);


    // au Bar Chart

    var auBarChartDom = document.getElementById('auBarChart');
    var auBarChart = echarts.init(auBarChartDom);

    auBarChartOption = {
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
        },
        xAxis: {
        type: 'category',
        data: ['금도금 불량 수']
        },
        yAxis: [
            {
            type: 'value',
            name: 'TotalDefects', 
            min: 0,
            max: total, // 변수로 해서 추가하면 됨 # ex) totalDefects = 100 
            show: false
            }
        ],
        series: [
        {
            data: [errorCount[2]],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.6)'
            },
            barWidth: '20%',
            itemStyle:{
            color: barColor,
            },
        }
        ]
    };

    auBarChart.setOption(auBarChartOption);


    // Scratch Bar Chart

    var scratchBarChartDom = document.getElementById('scratchBarChart');
    var scratchBarChart = echarts.init(scratchBarChartDom);

    scratchBarChartOption = {
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
        },
        xAxis: {
        type: 'category',
        data: ['스크래치 불량 수']
        },
        yAxis: [
            {
            type: 'value',
            name: 'TotalDefects', 
            min: 0,
            max: total, // 변수로 해서 추가하면 됨 # ex) totalDefects = 100 
            show: false
            }
        ],
        series: [
        {
            data: [errorCount[3]],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.6)'
            },
            barWidth: '20%',
            itemStyle:{
            color: barColor,
            },
        }
        ]
    };

    scratchBarChart.setOption(scratchBarChartOption);

}