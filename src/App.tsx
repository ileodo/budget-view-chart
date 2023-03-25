import './App.css';
import React, { useState, useEffect } from 'react';
import BudgetChart from './BudgetChart';
import { Dropdown, Spinner, Container, Alert, Form, ProgressBar, ListGroup, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

import {
    Link
} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { BudgetRecord } from './data.interface'
const axios = require('axios').default;

const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];
function displayAmount(amount: number) {
    let formatter = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    });

    return formatter.format(amount);
}

function filter(records: BudgetRecord[], budgetNames: Set<string>) {
    return records.filter(ele => budgetNames.has(ele["name"]))
}

function defaultYear(){
    const date = new Date();
    return date.getFullYear();
}
function defaultMonthlist(y:number){
    const date = new Date();
    if (y === date.getFullYear()) {
        return Array.from({ length: date.getMonth() + 1 }, (v, k) => k);
    } else {
        return Array.from({ length: 12 }, (v, k) => k);
    }
}
function defaultMonth(y:number){
    const date = new Date();
    if (y === date.getFullYear()) {
        return date.getMonth();
    } else {
        return 12;
    }
}

export const App: React.FC<{ demo: boolean }> = (props) => {
    const [year, setYear] = useState<number>(defaultYear());
    const [month, setMonth] = useState<number>(defaultMonth(year));
    const [dataset, setDataset] = useState<Map<number, BudgetRecord[]>>(new Map());
    const [currentDataset, setCurrentDataset] = useState<BudgetRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showAggregate, setShowAggregate] = useState<boolean>(false);
    const [monthList, setMonthList] = useState<number[]>(defaultMonthlist(year));
    const [selectedBudget, setSelectedBudget] = useState<Set<string>>(new Set());
    const [demoMode, setDemoMode] = useState<boolean>(props.demo);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    
    function loadData(year: number, isDemo:boolean, reset: boolean = false) {
        let localDataSet = dataset

        if (reset) {
            localDataSet = new Map();
        }

        let loadedData = localDataSet.get(year);
        if (!loadedData) {
            setIsLoading(true);

            if (isDemo) {
                console.log("loading demo data");
                setTimeout(() => {
                    const loadedData = require(`./data/data.${year}.json`);
                    localDataSet.set(year, loadedData);
                    setIsLoading(false);
                    setDataset(localDataSet);
                    setCurrentDataset(localDataSet.get(year) as BudgetRecord[]);
                    setLoadError(null);
                }, 500);
            } else {
                console.log("loading data from API");
                const host = process.env.REACT_APP_API_HOST || `.`;
                axios.get(`${host}/budget_breakdown/${year}`).then((res: any) => {
                    const loadedData = res.data;
                    localDataSet.set(year, loadedData);
                    setIsLoading(false);
                    setDataset(localDataSet);
                    setCurrentDataset(localDataSet.get(year) as BudgetRecord[]);
                    setLoadError(null);
                }).catch((err: any) => {
                    setIsLoading(false);
                    setDataset(localDataSet);
                    setCurrentDataset([]);
                    setLoadError(err.response.data.message || err.toString());
                });
            }

        } else {
            setIsLoading(false);
            setCurrentDataset(localDataSet.get(year) || []);
            setLoadError(null);
        }
    }

    function refreshAccount(){
        setIsRefreshing(true);
        const host = process.env.REACT_APP_API_HOST || `.`;
        axios.get(`${host}/budget_breakdown/refresh`).then((res: any) => {
            setIsRefreshing(false);
        }).catch((err: Error) => {
            setIsRefreshing(false);
        });
    }

    function switchBudget(budgetName: string) {
        if (selectedBudget.has(budgetName)) {
            selectedBudget.delete(budgetName);
        } else {
            selectedBudget.add(budgetName);
        }
        setSelectedBudget(new Set(selectedBudget));
    }

    function changeYear(y:number){
        setYear(y);
        loadData(y, demoMode)
        const date = new Date();
        if (y === date.getFullYear()) {
            setMonthList(Array.from({ length: date.getMonth() + 1 }, (v, k) => k))
            setMonth(date.getMonth());
        } else {
            setMonthList(Array.from({ length: 12 }, (v, k) => k))
            setMonth(11);
        }
    }

    function changeDemoMode(d:boolean){
        console.log("Switching demoMode to ", d)
        setDemoMode(d)
        loadData(year, d, true);
    }

    useEffect(() => {
        if (currentDataset) {
            let newSet = new Set(currentDataset.map(ele => ele.name));
            setSelectedBudget(newSet);
        }
    }, [currentDataset])

    useEffect(()=>{
        loadData(year, demoMode);
    },[])

    return (
        <Container as="main" className='py-4'>
            <header className="pb-3 mb-4 border-bottom">
                <Link to="/" className="d-flex align-items-center text-dark text-decoration-none float-start"><h1 className='display-4'>📒 MoneyDashboard Report</h1></Link>

                <div className='float-end hstack gap-1 mt-3'>
                    <Form.Switch inline
                        id="switch-demo"
                        label="Demo"
                        checked={demoMode}
                        onChange={
                            (val: any) => {
                                changeDemoMode(!demoMode);
                            }}
                    />
                    {!demoMode &&  <Button variant='dark' size="sm" onClick={refreshAccount} disabled={isRefreshing}><i className="bi bi-arrow-counterclockwise"></i></Button>}
                    
                    <Dropdown as="span">
                        <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                            {year === 0 ? "Choose Year" : year}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {
                                Array.from({ length: 3 }, (v, k) => 2022 - k)
                                    .map((y: number) => <Dropdown.Item key={y} eventKey={y} onClick={() => changeYear(y)}>{y}</Dropdown.Item>)
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown as="span">
                        <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                            {monthLabels[month]}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {
                                monthList
                                    .map((m: number) => <Dropdown.Item key={m} eventKey={m} onClick={() => setMonth(m)}>{monthLabels[m]}</Dropdown.Item>)
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="clearfix"></div>
            </header>

            <div className="h-100 px-1 py-3 p-md-5 mb-4 bg-light rounded-3 shadow">
                <h3 className='pb-3 px-3 px-md-0 border-bottom'>Annual Budget Summary</h3>
                {
                    isLoading
                        ?
                        <div className="align-middle" style={{ height: "calc(min(800px,100vh))" }}>
                            <Spinner animation="border" role="status" style={{ position: "relative", top: "50%", left: "50%" }}>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                        : loadError !== null ?
                            <Alert variant="danger">
                                <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                                <p>{loadError}</p>
                            </Alert>
                            :
                            <>
                                <div className="align-middle ps-2 ps-md-0" style={{ height: "calc(min(800px,100vh))" }}>
                                    <BudgetChart year={year} month={month} showCurrentLine={year === (new Date()).getFullYear()} showAggregate={showAggregate} value={filter(currentDataset, selectedBudget)} />
                                </div>
                                <div className='text-center'>

                                    <Form.Switch inline
                                        id="switch-aggregate"
                                        label="Aggregate Budgets"
                                        checked={showAggregate}
                                        onChange={
                                            (val: any) => {
                                                setShowAggregate(!showAggregate);
                                            }}
                                    />

                                </div>
                            </>
                }
            </div>

            <div className="row align-items-md-stretch">
                {demoMode &&
                    <div className="col-md-12 mb-4">
                        <div className="h-100 p-5 bg-light border rounded-3 shadow">
                            <h3 className='pb-3 px-3 px-md-0 border-bottom'>Data</h3>
                            <dl className="row">
                                <dt className="col-sm-3">Year</dt>
                                <dd className="col-sm-9">{year}</dd>

                                <dt className="col-sm-3">Month</dt>
                                <dd className="col-sm-9">{monthLabels[month]}</dd>

                                <dt className="col-sm-3">PUBLIC_URL</dt>
                                <dd className="col-sm-9">{process.env.PUBLIC_URL}</dd>

                            </dl>
                            <Form.Control as="textarea" rows={30} value={JSON.stringify(currentDataset, null, 2)}
                                onChange={(v) => {
                                    v.preventDefault()
                                    try {
                                        const data = JSON.parse(v.target.value);
                                        setCurrentDataset(data);
                                    } catch (error) {
                                    }
                                }}
                            />
                        </div>
                    </div>
                }
            </div>

            <footer className="pt-3 mt-4 text-muted border-top">
                iLeoDo  &copy; 2022
            </footer>
            {/* </main>   */}
        </Container >
    );
}

export default App;