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

        </div>
        <div className="clearfix"></div>
      </header>
      <Container className="h-100 px-1 py-3 p-md-5 mb-4 bg-light rounded-3 shadow">
        <h3 className="pb-3 px-3 px-md-0 border-bottom">budget-view-chart</h3>
        <div className="align-middle ps-2 ps-md-0" style={{ height: 'calc(min(800px,100vh))' }}>
          <BudgetChart config={config} value={currentDataset}/>
        </div>
        <div className="text-center">

          <Form.Switch inline
                       id="switch-aggregate"
                       label="Aggregate Budgets"
                       checked={showAggregate}
                       onChange={
                         (val: any) => {
                           setShowAggregate(!showAggregate)
                         }}
          />

        </div>
      </Container>
      <Container className="p-5 align-items-md-stretch h-100 bg-light border rounded-3 shadow">
        <Row>
          <Col className="col-md-6">
            <h3 className="pb-3 px-3 px-md-0 border-bottom">Config</h3>
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
      </footer>
    </Container>
  )
}

export default App
