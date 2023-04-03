import './App.css'
import React, { useState, useEffect } from 'react'
import {
  Dropdown,
  Container,
  Form,
  Row, Col
} from 'react-bootstrap'

import {
  Link
} from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import GitHubButton from 'react-github-btn'

import { BudgetChart, BudgetRecord, BudgetChartConfig } from 'budget-view-chart'

const DATA_SET: string[] = [
  'data.2021.json',
  'data.2022.json',
  'data.2023.json'
]

function loadData (name: string): BudgetRecord[] {
  return require(`./data/${name}`)
}

const defaultConfig: BudgetChartConfig = {
  showMonthEndLine: 3,
  showAggregate: false,
  locale: 'en-GB',
  currency: 'GBP'
}

export const App: React.FC = (props) => {
  const [dataSet, setDataSet] = useState<string>('data.2023.json')
  const [currentDataset, setCurrentDataset] = useState<BudgetRecord[]>(loadData(dataSet))
  const [config, setConfig] = useState<BudgetChartConfig>(defaultConfig)
  const [showAggregate, setShowAggregate] = useState<boolean>(defaultConfig.showAggregate)

  useEffect(() => {
    setCurrentDataset(loadData(dataSet))
  }, [dataSet])

  useEffect(() => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      showAggregate: showAggregate
    }))
  }, [showAggregate])

  return (
    <Container as="main" className="py-4">
      <header className="pb-3 mb-4 border-bottom">
        <Link to="/" className="d-flex align-items-center text-dark text-decoration-none float-start"><h1
          className="display-4">📒 budget-view-chart Demo</h1></Link>

        <div className="float-end hstack gap-1 mt-3">
          <GitHubButton href="https://github.com/ileodo/budget-view-chart" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star ileodo/budget-view-chart on GitHub">Star</GitHubButton>
        </div>
        <div className="clearfix"></div>
      </header>
      <Container className="h-100 px-1 py-3 p-md-5 mb-4 bg-light rounded-3 shadow">
        <div className="p-5" style={{ height: 'calc(min(800px,100vh))' }}>
          <BudgetChart config={config} value={currentDataset}/>
        </div>
      </Container>
      <Container className="p-5 align-items-md-stretch h-100 bg-light border rounded-3 shadow">
        <Row>
          <Col className="col-md-6">
            <h3 className="pb-3 px-3 px-md-0 border-bottom">Config</h3>

            <Form.Switch inline
                         id="switch-aggregate"
                         label="Aggregate Budgets"
                         checked={showAggregate}
                         onChange={
                           (val: any) => {
                             setShowAggregate(!showAggregate)
                           }}
            />

            <Form.Control as="textarea" rows={10} value={JSON.stringify(config, null, 2)}
                          onChange={(v) => {
                            v.preventDefault()
                            try {
                              const data = JSON.parse(v.target.value)
                              setConfig(data)
                            } catch (error) {
                            }
                          }}
            />
          </Col>
          <Col className="col-md-6">
            <h3 className="pb-3 px-3 px-md-0 border-bottom">Data</h3>
            <dl className="row">
              <dt className="col-sm-3">DataSet</dt>
              <dd className="col-sm-9">
                <Dropdown as="span">
                  <Dropdown.Toggle variant="dark" size="sm" id="dropdown-basic">
                    {dataSet}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {
                      DATA_SET.map(
                        (name: string) =>
                          <Dropdown.Item key={name} eventKey={name}
                                         onClick={() => setDataSet(name)}>{name}</Dropdown.Item>
                      )
                    }
                  </Dropdown.Menu>
                </Dropdown>
              </dd>


              <dt className="col-sm-3">PUBLIC_URL</dt>
              <dd className="col-sm-9">{process.env.PUBLIC_URL}</dd>

            </dl>
            <Form.Control as="textarea" rows={30} value={JSON.stringify(currentDataset, null, 2)}
                          onChange={(v) => {
                            v.preventDefault()
                            try {
                              const data = JSON.parse(v.target.value)
                              setCurrentDataset(data)
                            } catch (error) {
                            }
                          }}
            />
          </Col>
        </Row>
      </Container>
      <footer className="pt-3 mt-4 text-muted border-top">
        iLeoDo  &copy; 2023
        <a className="nav-link" href="https://github.com/ileodo/budget-view-chart"><span className="d-none d-sm-inline">View on GitHub </span>
          <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" className="octicon octicon-mark-github"
               aria-hidden="true">
            <path fill-rule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
        </a>
      </footer>
    </Container>
  )
}

export default App
