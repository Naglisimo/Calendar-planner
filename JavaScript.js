// State variables

let currentMontCounter = 0;
let clicked = null;
let toggledEvent = false;
let events = sessionStorage.getItem('events') ? JSON.parse(sessionStorage.getItem('events')) : [];
let errorMessages = [];


//getting calendar elements
const calendar = document.querySelector('.days');
const detailsViewContainer = document.querySelector('.detailsContainer');
const formView = document.querySelector('.form-vertical')
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const addEventButton = document.querySelector('.addEventButton');

// getting modal elements
const modal = document.getElementById('deletedModal');
const exitButton = document.getElementById('closeModal');


clicked !== null ? detailsViewContainer.style.display = 'flex' : detailsViewContainer.style.display = 'none';

//Form inputs

const formInputs = {
    title: document.getElementById('title'),
    date: document.getElementById('date'),
    startTime: document.getElementById('startTime'),
    endTime: document.getElementById('endTime'),
    type: document.getElementById('type'),
    description: document.getElementById('description')
}

// Form error messages

let errorField = document.getElementById('errorMessage');
errorMessages.length > 0 ? errorField.style.display = 'block' : errorField.style.display = 'none';

// functions for time calculation

const timeDiff = (start, end) => {
    start = start.split(":");
    end = end.split(":");
    let startDate = new Date(0, 0, 0, start[0], start[1], 0);
    let endDate = new Date(0, 0, 0, end[0], end[1], 0);
    let diff = endDate.getTime() - startDate.getTime();
    let hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    let minutes = Math.floor(diff / 1000 / 60)
    return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
}


const renderDetails = (date) => {
    // editing date format to handle date input value changes
    const splitted = date.split('-');
    let years = splitted[0];
    let months = splitted[1];
    let days = splitted[2];

    if (date.length < 10) {
        months < 10 ? months = "-0" + months : months = '-' + months;
        days < 10 ? days = '-0' + days : days = '-' + days;
    } else {
        months = '-' + months;
        days = '-' + days;
    }

    clicked = years + months + days;
    formInputs.date.setAttribute('value', clicked)

    const eventForThisDay = events.filter(event => event.date === clicked)

    if (eventForThisDay.length > 0) {

        detailsViewContainer.innerHTML = '';
        const callAddNewEventForm = document.createElement('button')
        callAddNewEventForm.className = 'addEventButton';
        callAddNewEventForm.innerText = 'Add new event';
        callAddNewEventForm.onclick = () => openFormView()
        detailsViewContainer.appendChild(callAddNewEventForm)

        eventForThisDay.map(event => {

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'details';
            detailsViewContainer.appendChild(detailsDiv);

            const detailsTitle = document.createElement('h2');
            detailsTitle.className = 'eventTitle';
            detailsTitle.innerText = `Your event is - ${event.title}`;
            detailsDiv.appendChild(detailsTitle);

            const detailsDate = document.createElement('p');
            detailsDate.className = 'eventDate'
            detailsDate.innerText = `It starts on : ${event.startDate}`;
            detailsDiv.appendChild(detailsDate);

            const detailsDuration = document.createElement('p');
            detailsDuration.className = 'eventDate'
            detailsDuration.innerText = `It will take about : ${event.duration}`;
            detailsDiv.appendChild(detailsDuration);

            const detailsType = document.createElement('p');
            detailsType.className = 'eventDate'
            detailsType.innerText = `Type of event : ${event.type}`;
            detailsDiv.appendChild(detailsType);

            if (event.description !== "") {
                const detailsDescription = document.createElement('p');
                detailsDescription.className = 'eventDate'
                detailsDescription.innerText = `Description : ${event.description}`;
                detailsDiv.appendChild(detailsDescription);
            }

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'buttonsDiv';
            detailsDiv.appendChild(buttonsDiv)

            const closeEventButton = document.createElement('button');
            closeEventButton.className = 'close';
            closeEventButton.innerText = 'Close'
            closeEventButton.addEventListener('click', () => closeDetailsView());
            buttonsDiv.appendChild(closeEventButton);

            const deleteEventButton = document.createElement('button');
            deleteEventButton.className = 'deleteEvent';
            deleteEventButton.setAttribute('value', `${event.id}`);
            deleteEventButton.innerText = 'Delete'
            deleteEventButton.addEventListener('click', (e) => deleteEvent(e));
            buttonsDiv.appendChild(deleteEventButton);
        })
        detailsViewContainer.style.display = 'flex';
        formView.style.display = 'none';
    } else {
        detailsViewContainer.style.display = 'none';
        formView.style.display = 'flex';
    }
    errorMessages.length > 0 ? errorField.style.display = 'block' : errorField.style.display = 'none';

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

    document.querySelector('.date h1').innerHTML = `${date.toLocaleDateString('en-us', { month: 'long' })} ${year}`

    const hiddenDays = weekDays.indexOf(dateString.split(', ')[0]) - 1

    calendar.innerHTML = '';

    for (let i = 0; i < hiddenDays + daysInMonth; i++) {
        const dayBlock = document.createElement('div');
        dayBlock.classList.add('day');
        const blockParagraph = document.createElement('p');
        dayBlock.appendChild(blockParagraph);

        const dayString = `${year}-${month + 1}-${i - hiddenDays}`;

        const splitted = dayString.split('-')
        let years = splitted[0];
        let months = splitted[1];
        let days = splitted[2];

        months < 10 ? months = "-0" + months : months = '-' + months;
        days < 10 ? days = '-0' + days : days = '-' + days;

        const newDayString = years + months + days;

        if (i > hiddenDays) {
            blockParagraph.innerText = i - hiddenDays;
            const eventForThisDay = events.filter(event => event.date === newDayString);

            if (i - hiddenDays === day && currentMontCounter === 0) {
                dayBlock.id = 'today';
            }
            if (eventForThisDay.length) {
                console.log('new day string', newDayString);
                console.log('we have an event for this day')
                const eventUl = document.createElement('ul');
                eventUl.classList.add('event')
                eventForThisDay.map(event => {
                    const eventLi = document.createElement('li');
                    eventUl.appendChild(eventLi)
                    eventLi.innerText = event.title;
                })
                dayBlock.appendChild(eventUl)
            }
            dayBlock.addEventListener('click', () => renderDetails(dayString))
        } else {
            dayBlock.classList.add('hidden')
        }
        calendar.appendChild(dayBlock);
    }
}


// event handling functions

const deleteEvent = (e) => {

    events = events.filter(event => e.target.value != event.id);
    sessionStorage.setItem('events', JSON.stringify(events));
    load();
    renderDetails(date.value);
    openModal();
}

const openFormView = () => {
    formView.style.display = 'flex';
    detailsViewContainer.style.display = 'none';
}

const closeFormView = () => {
    formView.style.display = 'none';
    clicked = null;
}

const closeDetailsView = () => {
    detailsViewContainer.style.display = 'none';
    clicked = null;
}



const submitEvent = (e) => {
    e.preventDefault();

    errorField.innerHTML = '';

    if (
        formInputs.title.value !== '' &&
        formInputs.date.value !== '' &&
        formInputs.startTime.value !== '' &&
        formInputs.endTime.value !== '' &&
        formInputs.type.value !== ''
    ) {
        events.push({
            title: formInputs.title.value,
            date: formInputs.date.value,
            duration: timeDiff(formInputs.startTime.value, formInputs.endTime.value),
            type: formInputs.type.value,
            description: formInputs.description.value,
            id: Math.floor(Math.random() * 10000)
        })
        sessionStorage.setItem('events', JSON.stringify(events));


        formInputs.title.value = '';
        formInputs.date.setAttribute('value', clicked);
        formInputs.startTime.value = '';
        formInputs.endTime.value = '';
        formInputs.type.value = '';
        formInputs.description.value = '';

        errorMessages = [];
    } else {
        errorMessages = [];
        if (formInputs.title.value === '') {
            errorMessages.push('Title is required!');
        }
        if (formInputs.date.value === '') {
            errorMessages.push('Date is required!');
        }
        if (formInputs.startTime.value === '') {
            errorMessages.push('Start event time is required!');
        }
        if (formInputs.endTime.value === '') {
            errorMessages.push('End event time is required!');
        }
        if (formInputs.type.value === '') {
            errorMessages.push('Type of event is required! ');
        }
        if (errorMessages.length > 0) {

            errorMessages.map(message => {
                let liElement = document.createElement('li');
                errorField.appendChild(liElement);
                liElement.innerText = message;
            })
        }
    }
    errorMessages.length > 0 ? errorField.style.display = 'block' : errorField.style.display = 'none';

    load();
    renderDetails(date.value);
}

// functions for modal

const openModal = () => {
    modal.style.display = 'block';
    setTimeout(closeModal, 6000);
}

const closeModal = () => {
    ``
    modal.style.display = 'none';
}

// Event listeners

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

    document.getElementById('closeModal').addEventListener('click', () => closeModal());
}

eventListeners();
load();