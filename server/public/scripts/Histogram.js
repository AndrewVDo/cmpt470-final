let grades = []
let totals = {}
let sliders = document.getElementsByClassName('slider')
let numStudents = 0
$(document).ready(() => {
    let req = $.ajax({
        url: 'fetch-grades',  
        type: 'GET',
        success: (data, textStatus, jqxhr) => {
            jqxhr.done((data) => {
                if(!data) {
                    console.error("No Response")
                    window.location = $(location).attr('origin')
                    return
                }
            
                if(!data.success) {
                    alert(data.msg ? data.msg : 'No message')
                    window.location = $(location).attr('origin')
                    return
                }
            
                
                const asyncCallback = async() => {
                    grades = await updateGrades(data.grades, totalTally(data.grades), true)
                    totals = totalTally(data.grades)
                    numStudents = grades.length - 1
                    updateHist()
                    setupSlider()
                }
                asyncCallback()
            })
        },
        contentType: 'application/json',
        dataType: 'json',
    })
})

const defs = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50]
function getNextSlider(i, def=false){
    if (i == 10) return 0
    if (def) return defs[i]
    return Number(sliders[i].value)
}
function getNextSliderOLD(i, def=false){
    if (i == 9) return 0
    if (def) return defs[i+1]
    return Number(sliders[i+1].value)
}
function getPrevSlider(i, def=false){
    if (i == 0) return 100
    if (def) return defs[i-1]
    return Number(sliders[i-1].value)
}

const setupSlider = () => {
    let dispCutoffs = document.getElementsByClassName('disp-cutoff')
    for(let i=0; i<sliders.length; i++){
        sliders[i].value = 95-5*i
        dispCutoffs[i].innerHTML = 95-5*i

        sliders[i].oninput = () => {
            if (sliders[i].value >= getPrevSlider(i) || sliders[i].value == 100){
                sliders[i].value = getPrevSlider(i)-1
            } else if (sliders[i].value <= getNextSliderOLD(i)) {
                sliders[i].value = getNextSliderOLD(i)+1
            }
            dispCutoffs[i].innerHTML = sliders[i].value
        }
        sliders[i].onmouseup = () => {
            const asyncCallback = async() => {
                grades = await updateGrades(grades, totals)
                updateHist()
            }
            asyncCallback()
        }
    }
}


const totalTally = (grades) => {
    let totals = {}
    let numStudents = 0
    for (let row in grades) {
        if(grades[row].studentID === 'total'){
            totals = grades[row]
        }
    }

    return totals
}

const updateGrades = (grades, totals, initial=false) => {
    return new Promise((resolve, reject) => {
        for(let row in grades) {
            if(grades[row].studentID !== 'total'){
                if(initial){
                    let totalPercent = 0
                    for(let prop in grades[row]) {
                        if(prop === 'studentID') continue
                        totalPercent += Number(grades[row][prop]) * Number(totals[prop]) / 100
                    }
                    grades[row].FINAL_PERCENT_CALCULATION = totalPercent
                }
                grades[row].FINAL_LETTER_GRADE = getLetterGrade(grades[row].FINAL_PERCENT_CALCULATION, initial)
            }
        }
        resolve(grades)
    })
}

const getLetterGrade = (percent, def=false) => {
    if(percent <= getPrevSlider(0, def) && percent >= getNextSlider(0, def)) return 'A+'
    else if(percent < getPrevSlider(1, def) && percent >= getNextSlider(1, def)) return 'A'
    else if(percent < getPrevSlider(2, def) && percent >= getNextSlider(2, def)) return 'A-'
    else if(percent < getPrevSlider(3, def) && percent >= getNextSlider(3, def)) return 'B+'
    else if(percent < getPrevSlider(4, def) && percent >= getNextSlider(4, def)) return 'B'
    else if(percent < getPrevSlider(5, def) && percent >= getNextSlider(5, def)) return 'B-'
    else if(percent < getPrevSlider(6, def) && percent >= getNextSlider(6, def)) return 'C+'
    else if(percent < getPrevSlider(7, def) && percent >= getNextSlider(7, def)) return 'C'
    else if(percent < getPrevSlider(8, def) && percent >= getNextSlider(8, def)) return 'C-'
    else if(percent < getPrevSlider(9, def) && percent >= getNextSlider(9, def)) return 'D'
    else if(percent < getPrevSlider(10, def) && percent >= getNextSlider(10, def)) return 'F'
}

const getGradeCount = (i) => {
    const letters = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    let count = 0
    for(let x in grades){
        if(grades[x].FINAL_LETTER_GRADE && grades[x].FINAL_LETTER_GRADE === letters[i]) count++
    }
    return count
}

const updateHist = () => {
    let bars = document.getElementsByClassName('dist-fill')
    for(let x=0; x<bars.length; x++) {
        bars[x].style.height = (13.25 * getGradeCount(x) / numStudents).toString() + 'em'
        bars[x].style.top = (13.25 - (13.25 * getGradeCount(x) / numStudents)).toString() + 'em'
    }
}

document.getElementById("print").addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    let x = 0
    while(grades[x].studentID !== 'total') x++
    for(y in grades[x]){
        csvContent += y + ','
    }
    csvContent += 'Final Percentage, Letter Grade\r\n'
    
    grades.forEach((row) => {
        if(row.studentID !== 'total'){
            for(let x in row){
                csvContent += row[x] + ','
            }
            csvContent += '\r\n'
        }
    })

    for (x in totals){
        csvContent += totals[x] + ',' 
    }
    csvContent += '\r\n'

    console.log(csvContent)

    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);

})


