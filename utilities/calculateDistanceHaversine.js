const degree2radian = degree => {
    return degree * (Math.PI / 180)
}

const calculateDistanceHaversine = (latitude1, longitude1, latitude2, longitude2) => {
    let radius = 6371
    let dLat = degree2radian(latitude2 - latitude1)
    let dLng = degree2radian(longitude2 - longitude1)
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degree2radian(latitude1)) * Math.cos(degree2radian(latitude2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    let d = radius * c
    return d
}

module.exports = calculateDistanceHaversine