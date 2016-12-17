const _ = require('lodash')

class CyIdx {
  constructor(name, type) {
    this.name = name
    this.type = type
    this.typeName = `${type}${name}`
    this.dateData = []
  }

  pushDateData(date, quote, change, changePercent, local) {
    this.dateData.push({
      quote: typeof quote === 'number' ? quote : '---',
      change: typeof change === 'number' ? change : '---',
      changePercent: typeof changePercent === 'number' ? changePercent : '---',
      local,
      yearROI: typeof (changePercent + 5.0) === 'number' ? changePercent + 5.0 : '---',
      date,
    })
  }

  initDateData(dateData) {
    this.dateData = dateData
  }

  setDateData(dateString, quote, change, changePercent, local) {
    this.dateData[dateString] = {
      quote,
      change,
      changePercent: typeof changePercent === 'number' ? changePercent : '---',
      local,
      // yearROI: (quote - this.getFirstQuoteInYear) / (this.getFirstQuoteInYear * 100),
      yearROI: changePercent + 5.0,
    }
  }

  getFirstQuoteInYear() {
    let minDateKey = _.keys(this.dateData)[0]
    for (const dateString of _.keys(this.dateData)) {
      if (parseInt(dateString, 10) < parseInt(minDateKey, 10)) minDateKey = dateString
    }
    return this.dateData[minDateKey].quote
  }
}

module.exports = CyIdx
