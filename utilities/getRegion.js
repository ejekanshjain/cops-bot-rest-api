const calculateDistanceHaversine = require('./calculateDistanceHaversine')
const regions = require('./regions')

const getRegion = (latitude, longitude) => {
    const distances = regions.map(region => calculateDistanceHaversine(latitude, longitude, region.latitude, region.longitude))
    const minDistance = Math.min(...distances)
    const minIndex = distances.findIndex(distance => {
        return distance === minDistance
    })
    return regions[minIndex].station
}

module.exports = getRegion