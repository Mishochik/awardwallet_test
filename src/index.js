import React, {useRef} from 'react';
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

    createRows() {
        const rows = [];
        this.state.data.forEach(row => {
            if (row.name.toLowerCase().indexOf(this.state.filterText.toLowerCase()) === -1 &&
                row.code.toLowerCase().indexOf(this.state.filterText.toLowerCase()) === -1) {
                return;
            }

            rows.push(row)
        });

        if (rows.length === 0 && this.state.filterText.length !== 0) {
            this.getAirports();
        }
        return rows;
    }

    render() {
        return (
            <div className={'wrapper'}>
                <SearchBar onFilterTextInput={this.search}/>
                <Table rows={this.createRows()}/>
            </div>

        );
    }
}

function SearchBar(props) {
    const timerHandler = useRef();
    return (
        <input
            onChange={event => {
                clearTimeout(timerHandler.current);
                const pendingValue = event.target.value;
                timerHandler.current = setTimeout(() => {
                    props.onFilterTextInput(pendingValue);
                }, 500);
            }}
        />
    );
}

class Table extends React.Component {
    renderRow() {
        const rows = [];
        this.props.rows.forEach((row, i) => {
            const filterData = {
                name: row.name,
                code: row.code,
                lat: row.location.latitude,
                lng: row.location.longitude,
            };
            rows.push(<Row key={i} value={filterData}/>)
        });

        return rows;
    }

    render() {
        return (
            <table>
                <thead>
                <tr>
                    <th>Name (Code)</th>
                    <th>Lat & Lng</th>
                </tr>
                </thead>
                <tbody>
                {this.renderRow()}
                </tbody>
            </table>
        );
    }
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

