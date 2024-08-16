

// API로부터 데이터 가져오기 (순위 테이블용)

// 이벤트 리스너 설정
document.getElementById('submit-btn').addEventListener('click', () => {
    // 날짜 입력 값 가져오기
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // 날짜 유효성 검사~
    if (startDate && endDate) {
        postData(startDate, endDate); // 데이터 전송 및 처리
    } else {
        alert('Please select both start and end dates.');
    }
});

// POST 요청을 통해 데이터 전송 및 데이터 가져오기
async function postData(start, end) {
    try {

        const defects_url = 'http://13.125.18.156/search/getSearchDefects';
        const list_defects_url = 'http://13.125.18.156/search/getSearchListDefects'

        // 만약 서버에서 사용시 아래의 uri 변수를 await fetch 함수 뒤에 넣어주면 됩니다 !
        // const defects_uri = '/search/getSearchDefects';
        // const list_defects_uri = '/search/getSearchListDefects'

        // 아래 defects_url을 defects_uri로 바꾸시면 됩니다.
        const defectsResponse = await fetch(defects_url, {
            method: 'POST', // HTTP 메소드 설정
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 전송
            },
            body: JSON.stringify({ start, end }) // 전송할 데이터를 JSON 문자열로 변환
        });

        if (!defectsResponse.ok) {
            throw new Error("getSearchDefects Error");
        }

        const defectsData = await defectsResponse.json();
        
        console.log('getSearchDefect 데이터')
        console.log(defectsData)
        

        // 페이지 좌측 부분 update
        rankDataAction(defectsData);


        // 아래 list_defects_url list_defects_uri 바꾸시면 됩니다.
        const listDefectsResponse = await fetch(list_defects_url, {
            method: 'POST', // HTTP 메소드 설정
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 전송
            },
            body: JSON.stringify({ start, end }) // 전송할 데이터를 JSON 문자열로 변환
        });

        if (!listDefectsResponse.ok) {
            throw new Error('getSearchListDefects response was not ok');
        }
        
        const listData = await listDefectsResponse.json(); // JSON 형식으로 변환

        console.log('getSearchDefectList 데이터');
        console.log(listData);
        

        populateTable(listData); // 테이블 (페이지 우측) 업데이트


    } catch (error) {
        console.error('Error posting data:', error);
    }
}


// async function fetchRankData() {
//   const defects_url = 'http://13.125.18.156/search/getSearchDefects';
//   try {
//       const response = await fetch(defects_url);
//       // 네트워크 응답이 정상인지 확인
//       if (!response.ok) {
//           throw new Error('Network response was not ok');
//       }
//       const data = await response.json(); // JSON 형식으로 변환
//       return data;
//   } catch (error) {
//       console.error('Error fetching rank data:', error);
//   }
// }

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

// 데이터 처리 및 정렬, 비율 계산
function processRankData(data) {
  // 모든 값의 총합 계산
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    // console.log(data);
  // 객체를 배열로 변환 후 값에 따라 내림차순으로 정렬
  const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

  // 비율 계산 및 배열을 객체 형태로 변환하여 반환
  return sortedData.map(([category, value]) => ({
      category,
      value,
      proportion: ((value / total) * 100).toFixed(1) // 백분율 계산 후 소수점 1자리로 포맷
  }));
}

// 정렬된 데이터를 기반으로 테이블 업데이트 (순위 테이블용)
function populateRankTable(data) {
  const tableBody = document.getElementById('rank-table').getElementsByTagName('tbody')[0];
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
        
// 처리 상태 변환 함수
function getProcessState(state) {
    switch (state) {
        case 0:
            return '대기';
        case 1:
            return '수리';
        case 2:
            return '폐기';
        default:
            return '알 수 없음';
    }
}

// 정렬된 데이터를 기반으로 테이블 업데이트
function populateTable(data) {
    const tableBody = document.getElementById('error-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // 기존 데이터 초기화

    data.forEach((item, index) => {
        const row = tableBody.insertRow(); // 새로운 행 추가
        const cell0 = row.insertCell(0); // 첫 번째 셀 (순번)
        const cell1 = row.insertCell(1); // 두 번째 셀 (제품ID)
        const cell2 = row.insertCell(2); // 세 번째 셀 (에러 종류)
        const cell3 = row.insertCell(3); // 네 번째 셀 (가로길이)
        const cell4 = row.insertCell(4); // 다섯 번째 셀 (세로길이)
        const cell5 = row.insertCell(5); // 여섯 번째 셀 (처리상태)
        const cell6 = row.insertCell(6); // 일곱 번째 셀 (발생일자)

        cell0.textContent = index + 1; // 순번
        cell1.textContent = item.prodid; // 제품ID
        cell2.textContent = item.error_type; // 에러 종류
        cell3.textContent = item.w; // 가로길이
        cell4.textContent = item.h; // 세로길이
        cell5.textContent = getProcessState(item.process_state); // 처리상태
        cell6.textContent = item.inspection_date; // 발생일자
    });
}



// 데이터를 가져와서 처리하고 순위 테이블에 표시
function rankDataAction(rawData) {

    const sortedData = processRankData(rawData); // 데이터 처리 및 정렬

    console.log(sortedData);

    populateRankTable(sortedData); // 테이블 업데이트

    // 차트 데이터를 위한 형식으로 변환
    const chartData = sortedData.map(item => ({
        value: item.value,
        name: getErrorType(item.category)
    }));

    const order = ['패턴 불량', '잉크 불량', '금도금 불량', '스크래치'];

    // 객체 배열을 정렬
    chartData.sort((a, b) => {
        return order.indexOf(a.name) - order.indexOf(b.name);
    });

    console.log(chartData)


    // 원차트 초기화 및 옵션 설정
    var pieChart = echarts.init(document.getElementById('pieChart'));

    // 차트 옵션 정의
    var option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: '불량 유형',
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
                        fontSize: '40',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: chartData // 변환된 차트 데이터 적용
            }
        ]
    };

    // 옵션을 차트에 설정하고 렌더링
    pieChart.setOption(option);
}
