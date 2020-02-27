import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from "axios";

// async function getInitialListAirports() {
//     try {
//         const response = await axios.get(
//             'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-radius?radius=6000&lng=57.915054&lat=56.010555',
//             {
//                 "headers": {
//                     "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
//                     "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
//                 }
//             }
//         );
//         return response;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }
//
// async function getAirportByName(name) {
//     try {
//         const response = await axios.get(
//             'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-text?text=' + name,
//             {
//                 "headers": {
//                     "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
//                     "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
//                 }
//             }
//         );
//         return response;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }
//
// async function getAirportByCode(code) {
//     try {
//         const response = await axios.get(
//             'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-code?code=' + code,
//             {
//                 "headers": {
//                     "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
//                     "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
//                 }
//             }
//         );
//         return response;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            filterText: '',
            loading: true,
        };
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        axios.get(
            'https://cometari-airportsfinder-v1.p.rapidapi.com/api/airports/by-radius?radius=6000&lng=57.915054&lat=56.010555',
            {
                "headers": {
                    "x-rapidapi-host": "cometari-airportsfinder-v1.p.rapidapi.com",
                    "x-rapidapi-key": "aae212215dmsh0aeb91f7306b2ddp1f8d34jsn2baf847ae58d"
                }
            }
        ).then(response => {
            const data = response.data;
            this.setState({data});
        })
    }

    search(filterText) {
        this.setState({filterText});
    }

    render() {
        return (
            <div className={'wrapper'}>
                <SearchBar
                    onFilterTextInput={this.search}
                />
                <Table
                    data={this.state.data}
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
    render() {
        const rows = [];
        this.props.data.forEach((item, i) => {
            const filterData = {
                name: item.name,
                code: item.code,
                lat: item.location.latitude,
                lng: item.location.longitude,
            };
            if (filterData.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1 &&
                filterData.code.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1) {
                return;
            }

            if(rows.length === 0 && this.props.filterText.length !== 0){
                console.log('Запрос: ', this.props.filterText)
            }
            rows.push(<Row key={i} value={filterData}/>)
        });

        return (
            <table>
                <thead>
                <tr>
                    <th>Name (Code)</th>
                    <th>Lat & Lng</th>
                </tr>
                </thead>
                <tbody>
                {rows}
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

