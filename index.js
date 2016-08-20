'use strict'

const json = require('json-file')
const rmp = require('rmp-api')
const unc = rmp('University of North Carolina at Chapel Hill')
const async = require('async')

const path = require('path')
const dat = json.read('./assets/UncCourses.json').data

// normalizeProfName :: String -> String
function normalizeProfName(str) {
  let seps = str.split(/[, ]/)
  if (seps.length < 2) {
    return str
  } else {
    return [seps[0], seps[1]].join(' ')
  }
}

// gatherProfData :: String -> (Maybe[ProfData] -> Unit) -> Unit
function gatherProfData(queryStr, cb) {
  if (queryStr === 'Staff') {
    cb(null)
  } else {
    unc.get(queryStr, data => {
      cb(data)
    })
  }
}

function getCoursePath(courseName) {
  return './output/' + courseName.split(' ').join('/') + '.json'
}

let directory = {}

async.eachLimit(dat, 10, (course, cb) => {
  let realname = course.instructor ? normalizeProfName(course.instructor) : 'SKHGDKSGHDKH'
  gatherProfData(realname, (data) => {
    course.rmp = data
    let key = course.subject + ' ' + course.catalog_nbr
    if (directory[key]) {
      directory[key].push(course)
    } else {
      directory[key] = [course]
    }
    cb()
  })

}, function() {
  const fs = require('fs')
  for (let courseName in directory) {
    let data = directory[courseName]
    let pas = getCoursePath(courseName)
    let dir = path.join('output', courseName.split(' ')[0])
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    fs.writeFile(pas, JSON.stringify(data), {flag: 'w+'}, (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
})
