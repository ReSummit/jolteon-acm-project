import React, { Component } from 'react';
import './editProfile.css';
import axios from 'axios';
export default class EditProfile extends Component {
    constructor(props) {
        super(props);

        // Setting the state that contains property of Profile
        this.state = {
            name: '',
            schedule: [[]],
        };

        // Binding 'this' to each of the methods
        this.addToSchedule = this.addToSchedule.bind(this);
        this.deleteFromSchedule = this.deleteFromSchedule.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
        this.onClearSchedule = this.onClearSchedule.bind(this);
        // this.displaySchedule = this.displaySchedule.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    // TEST Right before page loads, this will load
    componentDidMount() {
        // GET data from mongo
        let host = true;
        const attendeeId = "60af0ae8b7a86c365cf1aaa4";
        const hostId = "60af0a9db7a86c365cf1aaa3";
        if (host) {
            // fetch("http://localhost:5000/profile/60af0a9db7a86c365cf1aaa3", { method: 'GET' })
            //     .then(response => {
            //         console.log(response.json());
            //         if (response.data.length > 0) {
            //             this.setState({
            //                 name: response.data.name,
            //                 schedule: response.data.schedule
            //             });
            //         }
            //     })
            axios.get(`http://localhost:5000/profile/${hostId}`)
                .then(response => {
                        this.setState({
                            name: response.data.name,
                            schedule: response.data.schedule
                        })
                });
        } else {
            fetch(`/profile/${attendeeId}`)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        name: data.name,
                        schedule: data.schedule
                    })
                });
        }
    }

    // Change name
    onChangeName(e) {
        // set value of name to value within textbox
        this.setState({
            // name gets value from textbox
            name: e.target.value 
        });
    };

    // Submit changes
    onSubmit(e) {
        // Will do what we're about to define
        e.preventDefault(); 

        const profile = {
            name: this.state.name,
            schedule: this.state.schedule,
        }
        if(this.state.name === 'Host'){
            axios.post('http://localhost:5000/update/60af0a9db7a86c365cf1aaa3', {
                name: this.state.name,
                schedule: this.state.schedule
            }).then(res => console.log(res.data));
        }

        console.log("Print current profile", profile);

        // take user back to home page
        if(window.confirm("Setting saved! Go to home page?")){
            window.location = '/home';
        } else {
            console.log("Stay in Edit Profile")
        }
    }

    /**
     * onClick usage!
     * 
     * DELETE all time slots from schedule
     */
    onClearSchedule() {
        if(window.confirm("Are you sure you want to clear Schedule?")){
            let clear_schedule = this.state.schedule;
            clear_schedule.splice(0, clear_schedule.length)
            this.setState({ schedule: clear_schedule });
            console.log("Cleared Schedule!" + this.state.schedule);
        } else {
            console.log("Do not clear!");
        }
    };


    /**
     * onClick usage!
     * 
     * put new time in schedule
     */
    addToSchedule(){
        const range = (start, end, length = end - start + 1) =>
            Array.from({ length }, (_, i) => start + i)

        let first = Number(document.querySelector('#add-startTime').value.slice(0, 2));
        let second = Number(document.querySelector('#add-endTime').value.slice(0, 2))
        // CHECK empty input
        if (document.querySelector('#add-startTime').value === "" && document.querySelector('#add-endTime').value === "") {
            alert("Add time slot!");
        } else if (document.querySelector('#add-startTime').value === "") {
            alert("Add a start time!");
        } else if (document.querySelector('#add-endTime').value === "") {
            alert("Add an end time!");
        // Check if inputting correct time logic
        } else if (first > second){
            alert("End time must be past start time!");
        // GET input and PUT in schedule
        } else if (first < second){
            let validTime = true;
            // CHECK if valid time
            validTime = this.state.schedule.map((time) =>{
                let scheduleFrame = range(time[0],time[1]);
                let inputFrame = range(first+1,second-1);
                scheduleFrame.forEach((value)=>{
                    inputFrame.forEach((inputVal)=>{
                        if(value === inputVal){
                            return true;
                        }
                    })
                })
                return false;
            })
            // if valid Time
            if(validTime){
                let something = [];
                something[0] = first;
                something[1] = second;
                console.log("ADDED: " + something);

                this.setState(prevState => ({
                    schedule: [...prevState.schedule, something]
                }));
                setTimeout(() => {
                    console.log("AFTER PUSH", this.state.schedule)
                })
            } else {
                alert("Not a valid time slot!");
            }
        }
    };

    /**
     * onClick usage!
     * 
     * deletes specifc time slot based on input when button is clicked
     */
    deleteFromSchedule() {
        let first = Number(document.querySelector('#del-startTime').value.slice(0,2));
        let second = Number(document.querySelector('#del-endTime').value.slice(0,2));

        let index = 0;
        let removed_schedule = [...this.state.schedule];
        try{
            if(document.querySelector('#del-startTime').value === "" || document.querySelector('#del-endTime').value === ""){
                throw 'Fill in specfic time slot to delete'
            }
            // GO through schedule list and remove specify time slot
            removed_schedule.map((time) => {
                if (time[0] === first && time[1] === second) {
                    removed_schedule.splice(index, 1);
                    this.setState({ schedule: removed_schedule });
                } else {
                    index++;
                }
            })
        } catch (error){
            console.error(error)
        }
    }
    /**
     * DISPLAY time slots!
     * @returns <li> elements that show time slots
     */
    displaySchedule(){
        // Sorting Schedule 
        const scheduleList = this.state.schedule;
        for(let i =0; i < this.state.schedule.length; i++){
            for(let j=i+1; j < this.state.schedule.length-1; j++){
                if (scheduleList[i][1] > scheduleList[j][1]){
                    let temp = scheduleList[i];
                    scheduleList[i] = scheduleList[j];
                    scheduleList[j] = temp;
                }
            }
        }
        return(
            scheduleList.map((time) => <li key={time}>{time[0]}:00 - {time[1]}:00</li>)
        )
    };

    render() {
        return ( 
        <div>
            <h1>Edit Profile PAGE!</h1>
                <div className="form-group">
                    <label>Name: </label>
                    {/* Contains drop down of users*/}
                    <input 
                        required
                        className="form-control"
                        value={this.state.name}
                        onChange={this.onChangeName}>
                    </input>
                </div>
                {/* Make a list of all schedule of user*/}
                <div className="form-group">
                    <label className="schedule">Schedule (in hours): </label>
                    <ul>
                        {this.displaySchedule()}
                    </ul>
                    {/* Adding time slot */}
                    <div>
                        <label for="add-startTime">Start Time: </label>
                        <input id="add-startTime" type="time" step="any"/>
                        <label for="add-endTime">End Time: </label>
                        <input id="add-endTime" type="time" step="any"/>
                        <input type="submit" onClick={this.addToSchedule} value="Add Time Slot" className="btn btn-add" />
                    </div>
                    {/* Deleting time slot */}
                    <div>
                        <label for="del-startTime">Start Time: </label>
                        <input id="del-startTime" type="time" step="any"/>
                        <label for="del-endTime">End Time: </label>
                        <input id="del-endTime" type="time" step="any"/>
                        <input type="submit" onClick={this.deleteFromSchedule} value="Delete Time Slot" className="btn btn-delete" />
                    </div>
                    <div>
                        <button type="button" onClick={this.onClearSchedule}>Clear Schedule</button>
                    </div>
                </div>
                <div>
                    <input onClick={this.onSubmit} type="submit" value="Confirm Edit" className="btn btn-confirm"/>
                </div>
        </div>
        )
    }
}