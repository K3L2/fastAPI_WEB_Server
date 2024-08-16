
$(document).ready(function() {

    getThisWeekDefects();
    getWeeksDefects();

});


// 이번 주 불량 데이터 받아오기

function getThisWeekDefects() {

    const defects_url = 'https://api.npoint.io/a2737c95d789c7e570a2';
    // const defects_url = 'http://13.125.18.156/weeks/getThisWeekDefects';

    $.ajax({
        url: defects_url,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            // console.log(data)
            // 시작 날짜 끝 날짜
            setStartEnd(data)
            sortedData = processRankData(data);
            populateRankTable(sortedData)
            // console.log(sortedData);

            const chartData = sortedData.map(item => ({
                value: item.value,
                name: getErrorType(item.category)
            }));

            const order = ['패턴 불량', '잉크 불량', '금도금 불량', '스크래치'];

            // 객체 배열을 정렬
            chartData.sort((a, b) => {
                return order.indexOf(a.name) - order.indexOf(b.name);
            });


            plotPieChart(chartData)

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching rank data:', textStatus, errorThrown);
        }
    });
}

function getWeeksDefects() {

    const defects_url = 'https://api.npoint.io/15bce5b28c59e4d3191a'
    // const defects_url = 'http://13.125.18.156/weeks/getWeeksDefects';

    $.ajax({
        url: defects_url,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            
            plotBarChart(data)

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching rank data:', textStatus, errorThrown);
        }
    });
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

function setStartEnd(data) {
    $('#startDate').text(data['start'])
    $('#endDate').text(data['end'])
}

function processRankData(data) {
    // 모든 값의 총합 계산

    // 들어온 object에서 계산에 필요없는 값들 삭제
    delete data.start;
    delete data.end;

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

function populateRankTable(data) {
    const tableBody = document.getElementById('errorRankTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // 기존 데이터 초기화

    data.forEach((item, index) => {
        const row = tableBody.insertRow(); // 새로운 행 추가
        const cell0 = row.insertCell(0); // 첫 번째 셀 (순위)
        const cell1 = row.insertCell(1); // 두 번째 셀 (카테고리)
        const cell2 = row.insertCell(2); // 세 번째 셀 (비율)
        const cell3 = row.insertCell(3); // 네 번째 셀 (값)

        cell0.textContent = index + 1; // 순위 설정
        cell1.textContent = getErrorType(item.category); // 카테고리 이름 설정
        cell2.textContent = `${item.proportion}%`; // 비율에 % 기호 추가
        cell3.textContent = item.value; // 값 설정
    });
}

function plotPieChart(chartData) {
    var chartDom = document.getElementById('piChart');
    var myChart = echarts.init(chartDom);
    var option = {
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
                        fontSize: 40,
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
    myChart.setOption(option);
}

function plotBarChart(chartData) {
    const BORDER_RADIUS = 3

    var barChartDom = document.getElementById('barChart');
    var barChart = echarts.init(barChartDom);

    const temp = chartData['weeks'];
    const patternData = chartData['pattern'];
    const inkData = chartData['ink'];
    const auData = chartData['au'];
    const scratchData = chartData['scratch'];

    let x_axis = []

    temp.forEach(element => {
        
        x_axis.push(element + 'W');
    });

    console.log(chartData)

    barChartOption = {
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
        },
        legend: {},
        grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
        },
        xAxis: [
        {
            type: 'category',
            data: x_axis
        }
        ],
        yAxis: [
        {
            type: 'value'
        }
        ],
        series: [
        {
            name: '패턴 불량',
            type: 'bar',
            stack: 'Ad',
            emphasis: {
            focus: 'series'
            },
            data: patternData,
            // data: [40],
            barWidth: '45%',
            itemStyle: {
                barBorderRadius: BORDER_RADIUS,
                // color: '#91cc75'
            }
        },
        {
            name: '잉크 불량',
            type: 'bar',
            stack: 'Ad',
            emphasis: {
            focus: 'series'
            },
            data: inkData,
            // data: [22],
            itemStyle: {
                barBorderRadius: BORDER_RADIUS,
            }
        },
        {
            name: '금도금 불량',
            type: 'bar',
            stack: 'Ad',
            emphasis: {
            focus: 'series'
            },
            data: auData,
            // data: [6],
            itemStyle: {
                barBorderRadius: BORDER_RADIUS,
            }
        },
        {
            name: '스크래치',
            type: 'bar',
            stack: 'Ad',
            emphasis: {
            focus: 'series'
            },
            data: scratchData,
            // data: [15],
            itemStyle: {
                barBorderRadius: BORDER_RADIUS,
            }
        }
        ]
    };

    barChart.setOption(barChartOption);
}