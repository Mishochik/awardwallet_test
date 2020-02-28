import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from "axios";

const api = axios.create({
    "headers": {
        "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
        "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
    }
});


function getInitialAirports() {
    return api.get(
        'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-radius?radius=6000&lng=57.915054&lat=56.010555'
    )
}

function getAirportsByName(params) {
    return api.get(
        'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-text?text=' + params.text
    )
}

function getAirportsByCode(params) {
    return api.get(
        'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-code?code=' + params.text
    )
}

function unique(arr, key = 'airportId') {
    const result = [];

    function itemCheck(item) {
        if (result.indexOf(item[key]) === -1) {
            result.push(item[key]);
            return true
        }

        return false;
    }

    return arr.filter(item => itemCheck(item));
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filterText: '',
        };
        this.search = this.search.bind(this);
        this.getAirports = this.getAirports.bind(this);
        // this.creationRows = this.creationRows.bind(this);
    }

    async componentDidMount() {
        const response = await getInitialAirports();
        const data = response.data;
        this.setState({data});
    }

    search(filterText) {
        this.setState({filterText});
    }

    async getAirports() {
        if (this.state.filterText.length === 0) {
            return
        }

        let airportsByCode = {data: []};
        if (this.state.filterText.length < 4) {
            airportsByCode = await getAirportsByCode({text: this.state.filterText});
        }

        const airportsByName = await getAirportsByName({text: this.state.filterText});
        if (airportsByName.data.length !== 0 || airportsByCode.data.length !== 0) {
            const data = unique(this.state.data.concat(airportsByName.data, airportsByCode.data));
            this.setState({data});
        }
    }

    creationRows() {
        const rows = [];
        this.state.data.forEach(item => {
            const filterData = {
                name: item.name,
                code: item.code,
                lat: item.location.latitude,
                lng: item.location.longitude,
            };
            rows.push(<Row key={item.airportId} value={filterData}/>)
        });

        return this.filterRows(rows);
    }

    filterRows(rows) {
        const filterRows = [];
        rows.forEach(row => {
            if (row.props.value.name.toLowerCase().indexOf(this.state.filterText.toLowerCase()) === -1 &&
                row.props.value.code.toLowerCase().indexOf(this.state.filterText.toLowerCase()) === -1) {
                return;
            }

            filterRows.push(row)
        });

        if (filterRows.length === 0 && this.state.filterText.length !== 0) {
            this.getAirports();
        }

        return filterRows;
    }

    render() {
        return (
            <div className={'wrapper'}>
                <SearchBar onFilterTextInput={this.search}/>
                <Table rows={this.creationRows()}/>
            </div>

        );
    }
}

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.inputListener = this.inputListener.bind(this);
    }

    inputListener(event) {
        this.props.onFilterTextInput(event.target.value);
    }

    render() {
        return (
            <div>
                <input
                    type="text"
                    placeholder="Поиск..."
                    onChange={this.inputListener}
                />
            </div>
        );
    }
}

function Table(props) {
    return (
        <table>
            <thead>
            <tr>
                <th>Name (Code)</th>
                <th>Lat & Lng</th>
            </tr>
            </thead>
            <tbody>
            {props.rows}
            </tbody>
        </table>
    );
}

function Row(props) {
    return (
        <tr>
            <td>{props.value.name} ({props.value.code})</td>
            <td>{props.value.lat} {props.value.lng}</td>
        </tr>
    );
}

ReactDOM.render(<App/>, document.getElementById('root'));

