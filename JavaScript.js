// State variables

let currentMontCounter = 0;
let clicked = null;
let toggledEvent = false;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];



const calendar = document.querySelector('.days');
const detailsView = document.querySelector('.details'); 
const formView = document.querySelector('.form-vertical')
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const addEventButton = document.querySelector('.addEventButton');
const modalSuccess = document.getElementById('modalSuccess');
const modalFailed = document.getElementById('modalFailed');

clicked !== null ? detailsView.style.display = 'flex': detailsView.style.display = 'none';

//Form inputs

const formInputs = {
    title: document.getElementById('title'),
    date: document.getElementById('date'),
    startTime: document.getElementById('startTime'),
    endTime: document.getElementById('endTime'),
    type: document.getElementById('type'),
    description: document.getElementById('description')
}


// functions for time calculation

const timeDiff = (start, end) => {
    start = start.split(":");
    end = end.split(":");
    let startDate = new Date(0, 0, 0, start[0], start[1], 0);
    let endDate = new Date(0, 0, 0, end[0], end[1], 0);
    let diff = endDate.getTime() - startDate.getTime();
    let hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    let minutes = Math.floor(diff / 1000 / 60);

    return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
}




const renderDetails = (date) => {
    

    // editing date format to handle date input value changes

    const splitted = date.split('-')
    let years = splitted[0];
    let months = splitted[1];
    let days = splitted[2];

    months < 10 ? months ="-0" + months : months = '-' + months;
    days < 10 ? days = '-0' + days : days = '-' + days;
    
    clicked = years + months + days;

    formInputs.date.setAttribute('value', clicked)


    const eventForThisDay = events.find(e => e.date === clicked)
    console.log(eventForThisDay)

    if (eventForThisDay) {
        detailsView.style.display = 'flex';
        formView.style.display = 'none';
    } else {
        detailsView.style.display = 'none';
        formView.style.display = 'flex';
    }
}


// Loading month days

const load = () => {
    const date = new Date();

    if (currentMontCounter !== 0) {
        date.setMonth(new Date().getMonth() + currentMontCounter);
    } 

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const firsDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firsDayOfMonth.toLocaleDateString('en-us', { 
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });

    document.querySelector('.date h1').innerHTML = `${date.toLocaleDateString('en-us', {month: 'long'})} ${year}`

    const hiddenDays = weekDays.indexOf(dateString.split(', ')[0]) - 1

    calendar.innerHTML = '';

    for(let i = 0; i < hiddenDays + daysInMonth ; i++) {
        const dayBlock = document.createElement('div');
        dayBlock.classList.add('day');
        const blockParagraph = document.createElement('p');
        dayBlock.appendChild(blockParagraph);

        const dayString = `${year}-${month + 1}-${i - hiddenDays}`;

        const splitted = dayString.split('-')
        let years = splitted[0];
        let months = splitted[1];
        let days = splitted[2];
    
        months < 10 ? months ="-0" + months : months = '-' + months;
        days < 10 ? days = '-0' + days : days = '-' + days;

        const newDayString = years + months + days;

        console.log('newDayString', newDayString);  // taisyti day string

        if ( i > hiddenDays) {
            blockParagraph.innerText = i - hiddenDays;

            const eventForThisDay = events.find(e => e.date === newDayString)

            console.log(events)
            
            if (i - hiddenDays === day && currentMontCounter === 0) {
                dayBlock.id = 'today';
            }

            if ( eventForThisDay ) {
                console.log('we have an event for this day')
                const eventParagraph = document.createElement('p');
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event')
                eventDiv.appendChild(eventParagraph)
                eventParagraph.innerText = eventForThisDay.title;
                dayBlock.appendChild(eventDiv)
            }
            dayBlock.addEventListener('click', (e) => renderDetails(dayString))
        } else {
            dayBlock.classList.add('hidden') 
        }
        calendar.appendChild(dayBlock);
    }
}


// event handling functions

const deleteEvent = () => {
    events = events.filter(event => event.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    detailsView.style.display = 'none';
    load();
    
}

const closeFormView = () => {
    formView.style.display = 'none';
    clicked = null;
}

const closeDetailsView = () => {
    detailsView.style.display = 'none';
    clicked = null;
}

const submitEvent = (e) => {
    e.preventDefault();
    if (
        formInputs.title.value !== '' &&
        formInputs.date.value !== '' &&
        formInputs.startTime.value !== '' &&
        formInputs.endTime.value !== '' &&
        formInputs.type.value !== ''
    ) { events.push({
        title: formInputs.title.value,
        date: formInputs.date.value,
        duration: timeDiff(formInputs.startTime.value, formInputs.endTime.value ),
        type: formInputs.type.value,
        description: formInputs.description.value
            }) 

        localStorage.setItem('events', JSON.stringify(events));
        setTimeout(() => {modalSuccess.classList.add('show')}, 2000)
        setTimeout(() => {modalSuccess.classList.remove('show')}, 2000)
    } else {
        modalFailed.classList.add('show');
    } 
  
    formInputs.title.value = '';
    formInputs.date.value = '';
    formInputs.startTime.value = '';
    formInputs.endTime.value = '';
    formInputs.type.value = '';
    formInputs.description.value = '';

    load();
    renderDetails();
}



const eventListeners = () => {

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMontCounter++;
        load();
    })

    document.getElementById('previousMonth').addEventListener('click', () => {
        currentMontCounter--;
        load();
    });

    document.querySelector('.cancel').addEventListener('click', () => closeFormView());
    document.querySelector('.addEventButton').addEventListener('click', (e) => submitEvent(e));
    document.querySelector('.close').addEventListener('click', () => closeDetailsView());
    document.querySelector('.deleteEvent').addEventListener('click', () => deleteEvent());
}

eventListeners();
load();