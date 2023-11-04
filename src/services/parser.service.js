const models = require('../models')
const puppeteer = require('puppeteer')
const { TimeoutError } = require('puppeteer')
const moment = require('moment')
const _ = require('lodash')

class ParserService {
    static actualRequestId = false
    static actualRequestInWork = {}
    static processInWorkCount = {}
    static hotelsInWork = {}
    static metaDataInWork = {}

    static async createRequest({ place, rating = [], price = [], reportCount, destType }) {
        const request = await models.RequestModel.create({ place, rating: rating.join(','), price: price.join(','), reportCount, destType: destType })
        await ParserService.deleteOldRequests()
        ParserService.initRequest(request, 13)
        return request
    }

    static initRequest(request, processesCount) {
        ParserService.startParsingV3(request, processesCount)
    }

    static async postHotelsByNames(page, page2, hotelNames, currentRequestId, country) {
        const hotels = [...hotelNames]

        while (hotels.length > 0 && ParserService.actualRequestId === currentRequestId) {
            try {
                if (!ParserService.hotelsInWork[currentRequestId].includes(hotels[0])) {
                    ParserService.hotelsInWork = {
                        ...ParserService.hotelsInWork,
                        [currentRequestId]: [
                            ...ParserService.hotelsInWork[currentRequestId],
                            hotels[0]
                        ]
                    }
                    const hotelInfo = await ParserService.getEmailFromOfficialSite(page, page2, hotels[0])

                    if (hotelInfo?.name) {
                        const {name, emails, executionTime, officialUrl} = hotelInfo
                        console.log('post', country)
                        await models.HotelModel.create({
                            name,
                            email: emails?.join(','),
                            executionTime,
                            officialUrl,
                            country,
                            requestId: currentRequestId
                        })
                    }
                } else {
                    console.log('double!')
                    return true
                }

                hotels.shift()
            } catch (err) {
                hotels.shift()
                console.log(err)
            }
        }
    }

    static async startParsingV3(request, processesCount) {
        ParserService.actualRequestId = request.id
        ParserService.processInWorkCount = { ...ParserService.processInWorkCount, [request.id]: processesCount }
        ParserService.hotelsInWork = { ...ParserService.hotelsInWork, [request.id]: [] }
        ParserService.actualRequestInWork = { ...ParserService.actualRequestInWork, [request.id]: request }
        ParserService.metaDataInWork = { ...ParserService.metaDataInWork, [request.id]: [] }

        await ParserService.setRequestMetaData(ParserService.actualRequestInWork[request.id])

        for (let i = 0; i < processesCount; i++) {
            console.log(`start process ${i + 1}`)
            ParserService.startParsingV2(request.id, i, processesCount)
        }
    }

    static async getBrowser(setPageBookingJavaScriptDisabled = true) {
        try {
            const browser = await puppeteer.launch({ headless: true, devtools: true,
                executablePath: '/usr/bin/chromium-browser',
                args: ['--no-sandbox']
            })
            const pageBooking = await browser.newPage()
            const pageMaps = await browser.newPage()
            const pageOfficialSite = await browser.newPage()

            await pageBooking.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')

            if (setPageBookingJavaScriptDisabled) {
                await pageBooking.setJavaScriptEnabled(false)
                await pageBooking.setRequestInterception(true);
                pageBooking.on('request', request => {
                    if (['image', 'font', 'stylesheet'].includes(request.resourceType())) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                })
            }

            await pageMaps.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')
            await pageOfficialSite.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')
            await pageOfficialSite.setRequestInterception(true);
            pageOfficialSite.on('request', request => {
                if (['image', 'font'].includes(request.resourceType())) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            return [browser, pageBooking, pageMaps, pageOfficialSite]
        } catch (err) {
            return await ParserService.getBrowser(setPageBookingJavaScriptDisabled)
        }

    }

    static async startParsingV2(currentRequestId, i, processesCount) {
        const [browser, pageBooking, pageMaps, pageOfficialSite] = await ParserService.getBrowser()

        let processNumber = 0

        while (ParserService.actualRequestId === currentRequestId) {
            try {
                const [hotelNames, country] = await ParserService.getHotelsWithCheckDouble(pageBooking, ParserService.actualRequestInWork[currentRequestId], { processNumber, processesCount, i })

                if (hotelNames?.length > 0) {
                    await ParserService.postHotelsByNames(pageMaps, pageOfficialSite, hotelNames, currentRequestId, country)
                } else {
                    if (ParserService.actualRequestInWork[currentRequestId].destType === 'country') {
                        if (_.size(ParserService.metaDataInWork[currentRequestId]) === 0) {
                            await browser.close()
                            break
                        }
                    } else {
                        await browser.close()
                        break
                    }
                }
                processNumber = processNumber + 1

            } catch (err) {
                processNumber = processNumber + 1
                console.log(err)
            }
        }
        ParserService.processInWorkCount[currentRequestId] = ParserService.processInWorkCount[currentRequestId] - 1
        console.log(ParserService.processInWorkCount)
        await browser.close()
        if (ParserService.actualRequestId === currentRequestId && ParserService.processInWorkCount[currentRequestId] < 1) {
            ParserService.actualRequestId = false
            ParserService.hotelsInWork = { ...ParserService.hotelsInWork, [currentRequestId]: [] }
        }
    }

    static stopParsing() {
        ParserService.actualRequestId = false
    }

    static async getHotels(page, request, processMetaData) {
        const [url, uf] = ParserService.getBookingUrl(request, processMetaData)

        await page.goto(url, { waitUntil: 'networkidle2' })

        const country = await page.$eval('div[data-testid="breadcrumbs"]', element => Array.from(element.querySelector('ol').querySelectorAll('li'))[1].querySelector('a').querySelector('span').innerText)

        let names
        if (+request?.reportCount === 0) {
            names = await page.$$eval('div[data-testid="title"]', (elements) => elements.map(el => el.innerText))
        } else {
            names = await page.$$eval('div[data-testid="property-card-container"]', cards => {
                return cards.map(card => {
                    const name = card.querySelector('div[data-testid="title"]').innerText
                    const reviewScope = card.querySelector('div[data-testid="review-score"]')

                    if (reviewScope !== null) {
                        if (reviewScope.querySelectorAll('div')[3]) {
                            const reportCount = +reviewScope.querySelectorAll('div')[3]?.innerText?.split(' ')[0]

                            return { name, reportCount }
                        }
                    }
                })
            })

            names = names.filter(name => {
                if (name === null) return false

                return name.reportCount > +request?.reportCount;
            }).map(name => name.name)
        }


        //await browser.close()
        //console.log(names)
        console.log('get-hotel', country)
        console.log(url)
        console.log(names)
        console.log(ParserService.metaDataInWork)

        return [names, country, uf]
    }

    static async getHotelsWithCheckDouble(page, request, processMetaData) {
        if (request.destType === 'country') {
            const [names, country, uf] = await ParserService.getHotels(page, request, processMetaData)
            if (_.isArray(names)) {
                const uniqueNames = names.filter(name => !ParserService.hotelsInWork[request.id].includes(name))

                if (_.size(uniqueNames) > 0) {
                    return [uniqueNames, country]
                } else {
                    ParserService.metaDataInWork = {
                        ...ParserService.metaDataInWork,
                        ...ParserService.metaDataInWork[request.id].filter(item => item.name !== uf)
                    }

                    if (_.size(ParserService.metaDataInWork[request.id]) <= 0) {
                        return [[], country, uf]
                    }

                    return await ParserService.getHotelsWithCheckDouble(page, request, processMetaData)
                }
            }
        }

        return await ParserService.getHotels(page, request, processMetaData)

    }

    static getBookingUrl({ id, place, rating, price, destType }, { processNumber, processesCount, i }) {
        let offset = processNumber * 25 * processesCount + 25 * i
        const checking = moment().add('4', 'M').format('YYYY-MM-DD')
        const checkout = moment().add('4', 'M').add('3', 'd').format('YYYY-MM-DD')

        let ratingUrl = ''
        let priceUrl = ''
        let nfltUrl = ''
        let offsetUrl = ''
        let uf = ''

        if (rating) {
            ratingUrl = rating.split(',').join(';')
        }

        if (price) {
            priceUrl = `price=EUR-${price.split(',')[0]}-${price.split(',')[1]}-1`
        }

        if (offset) {
            offsetUrl = `&offset=${offset}`
        }

        if (priceUrl || ratingUrl) {
            if (destType === 'country') {
                if (ParserService.metaDataInWork[id]?.length > 0) {
                    uf = ParserService.metaDataInWork[id][0]?.name
                    nfltUrl = `&nflt=${encodeURIComponent(priceUrl + ';' + uf + ';' + ratingUrl)}`
                    offsetUrl =  `&offset=${ParserService.metaDataInWork[id][0]?.value}`

                    _.set(ParserService.metaDataInWork, `${id}.[0].value`, ParserService.metaDataInWork[id][0]?.value + 25)

                    if (ParserService.metaDataInWork[id][0]?.value > 976) {
                        _.invoke(ParserService.metaDataInWork, `${id}.shift`)
                    }
                }
            } else {
                nfltUrl = `&nflt=${priceUrl + ';' + ratingUrl}`
            }
        }

        const url = `https://www.booking.com/searchresults.ru.html?ss=${encodeURI(place)}${nfltUrl}&group_adults=2&no_rooms=1&group_children=0&checkin=${checking}&checkout=${checkout}&selected_currency=EUR${offsetUrl}`
        console.log(url)
        return [url, uf]
    }

    static async getEmailFromOfficialSite(page, page2, hotelName) {
        const start = new Date().getTime()
        console.log(2)
        try {
            // const browser = await puppeteer.launch({ headless: true, devtools: true,
            //     executablePath: '/usr/bin/chromium-browser',
            //     args: ['--no-sandbox']
            // })
            //
            // const page = await browser.newPage()

            await page.goto('https://www.google.ru/maps/', { waitUntil: 'networkidle2' })

            await page.type(`input[name=q]`, hotelName, {delay: 20})

            await page.waitForSelector('div[data-index="0"]')
            await page.click('div[data-index="0"]')

            try {
                await page.waitForSelector('a[data-tooltip="Перейти на сайт"]', { timeout: 5000 })
            } catch (err) {
                if (err instanceof TimeoutError) {
                    await page.waitForSelector('div[role="feed"]')
                    await page.evaluate(() => document.querySelector('div[role="feed"]').querySelectorAll('a')[1].click())
                    await page.waitForSelector('a[data-tooltip="Перейти на сайт"]', { timeout: 5000 })
                }
            }

            const url = await page.$eval('a[data-tooltip="Перейти на сайт"]', (element) => element.href)

            if (url) {
                //const page2 = await browser.newPage()

                await page2.goto(url, { waitUntil: 'networkidle2' })
                const htmlPage = await page2.evaluate(() => document.documentElement.innerHTML)
                const match = htmlPage.match(/[\w.-]+@[\w.-]+\.\w+/gu)

                //await browser.close()

                if (match) {
                    const emails = Array.from(new Set(match.filter((item => {
                        return  !/\.jpg$/ug.test(item) &&
                                !/[0-9]$/ug.test(item) &&
                                !/\.png$/ug.test(item) &&
                                !/wixpress/ug.test(item)
                    }))))

                    return {
                        name: hotelName,
                        emails: emails?.length > 1 ? [emails[0]] : emails,
                        executionTime: new Date().getTime() - start,
                        officialUrl: url
                    }
                } else {
                    return {
                        name: hotelName,
                        emails: [],
                        executionTime: new Date().getTime() - start,
                        officialUrl: url
                    }
                }
            } else {
                //await browser.close()
                return {
                    name: hotelName,
                    emails: [],
                    executionTime: new Date().getTime() - start,
                    officialUrl: null
                }
            }
        } catch (error) {
            //browser ? await browser.close() : null
            console.log(error)
                return {
                    name: hotelName,
                    emails: [],
                    executionTime: new Date().getTime() - start,
                    officialUrl: null
                }
        }
    }

    static async getHotelsByRequest(requestId, page) {
        return await ParserService.getHotelsInDB(requestId, page)
    }

    static async getHotelsByCurrentRequest(page) {
        if (ParserService.actualRequestId) {
            return await ParserService.getHotelsInDB(ParserService.actualRequestId, page)
        }

        const lastRequest = await models.RequestModel.findAll({raw: true, order: [['createdAt', 'DESC']], limit: 1})

        if (lastRequest.length > 0) {
            return ParserService.getHotelsInDB(lastRequest[0].id, page)
        }

        return []
    }

    static async getHotelsInDB(requestId, page) {
        const data =  await models.HotelModel.findAll({where: {requestId: requestId}, raw: true})
        const filteredData = data.filter(item => item?.email)

        return {
            result: data.filter(item => item?.email).slice(page*30, page*30 + 30),
            total: filteredData.length
        }

    }

    static async deleteOldRequests() {
        const requests = await models.RequestModel.findAll({offset: 20, order: [['createdAt', 'DESC']]})

        await Promise.all(requests.map(async request => {
            await models.HotelModel.destroy({where: { requestId: request.id }})
            await models.RequestModel.destroy({ where: {id: request.id} })
        }))
    }

    static async setRequestMetaData(request) {
        try {
            if (request?.destType === 'country') {
                const [url, uf] = ParserService.getBookingUrl(request, { processNumber: 0, processesCount: 0, i: 0 })

                const [browser, pageBooking, pageMaps, pageOfficialSite] = await ParserService.getBrowser(false)

                await pageBooking.goto(url, { waitUntil: 'networkidle2' })

                await pageBooking.$$eval('button[data-testid="filters-group-expand-collapse"]', elements => {
                    elements.map(el => el.click())
                })

                await pageBooking.waitForSelector('div[data-filters-group="uf"]')

                const cities = await pageBooking.$eval('div[data-filters-group="uf"]', element => {
                    if (!element) {
                        return []
                    }
                    return [...element.querySelectorAll('div')]
                        .filter(item => item.getAttribute('data-filters-item'))
                        .map(item => item.getAttribute('data-filters-item').split(':')[1])
                })

                ParserService.metaDataInWork = {
                    ...ParserService.metaDataInWork,
                    [request.id]: [
                        ...ParserService.metaDataInWork[request.id],
                        ...cities.map(item => ({ name: item, value: 0 }))
                    ]
                }

                console.log(ParserService.metaDataInWork)

                await browser.close()
            }
        } catch (err) {
            console.log(err)
            return await ParserService.setRequestMetaData(request)
        }

    }
}

module.exports = ParserService