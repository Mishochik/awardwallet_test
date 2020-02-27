import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from "axios";

function getInitialAirports() {
    return axios.get(
        'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-radius?radius=6000&lng=57.915054&lat=56.010555',
        {
            "headers": {
                "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
                "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
            }
        }
    )
}

function getAirportsByName(params) {
    return axios.get(
        'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-text?text=' + params.text,
        {
            "headers": {
                "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
                "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
            }
        }
    )
}

function getAirportsByCode(params) {
    return axios.get(
        'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-code?code=' + params.text,
        {
            "headers": {
                "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
                "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
            }
        }
    )
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filterText: '',
            loading: true,
        };
        this.search = this.search.bind(this);
        this.getAirports = this.getAirports.bind(this);
    }

    componentDidMount() {
        getInitialAirports().then(response => {
            const data = response.data;
            this.setState({data});
        })
    }

    search(filterText) {
        this.setState({filterText});
    }


    getAirports() {
        axios.all([getAirportsByName({text: this.state.filterText}), getAirportsByCode({text: this.state.filterText})])
            .then(axios.spread((airportsByName, airportsByCode) => {
                if (airportsByName.data.length !== 0 || airportsByCode.data.length !== 0) {
                    const data = this.state.data.concat(airportsByName.data, airportsByCode.data);
                    this.setState({data});
                }
            }));
    }

    render() {
        return (
            <div className={'wrapper'}>
                <SearchBar
                    onFilterTextInput={this.search}
                />
                <Table
                    data={this.state.data}
                    getAirports={this.getAirports}
                    filterText={this.state.filterText}
                />
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

class Table extends React.Component {
    renderRow() {
        const rows = [];
        this.props.data.forEach((item, i) => {
            const filterData = {
                name: item.name,
                code: item.code,
                lat: item.location.latitude,
                lng: item.location.longitude,
            };
            rows.push(<Row key={i} value={filterData}/>)
        });

        return this.filterRows(rows);
    }

    filterRows(rows) {
        const filterRows = [];
        rows.forEach(row => {
            if (row.props.value.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1 &&
                row.props.value.code.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1) {
                return;
            }

            filterRows.push(row)
        });

        if (filterRows.length === 0 && this.props.filterText.length !== 0) {
            this.props.getAirports();
        }

        return filterRows
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

