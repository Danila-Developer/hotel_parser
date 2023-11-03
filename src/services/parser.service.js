const models = require('../models')
const puppeteer = require('puppeteer')
const { TimeoutError } = require('puppeteer')
const moment = require('moment')

class ParserService {
    static actualRequestId = false
    static actualRequest = false
    static processInWorkCount = {}
    static hotelsInWork = {}

    static async createRequest({ place, rating = [], price = [], reportCount }) {
        //ParserService.stopParsing()
        const request = await models.RequestModel.create({ place, rating: rating.join(','), price: price.join(','), reportCount })
        await ParserService.deleteOldRequests()
        ParserService.initRequest(request, 14)
        return request
    }

    static initRequest(request, processesCount) {
        ParserService.actualRequestId = request.id
        ParserService.actualRequest = request
        ParserService.startParsingV3(request.id, processesCount)
    }

    // static async startParsing() {
    //     let offset = 0
    //
    //     while (ParserService.actualRequestId) {
    //         try {
    //             const [hotelNames, country]  = await ParserService.getHotels(ParserService.actualRequest, offset)
    //             if (hotelNames?.length > 0 && country) {
    //                 for (let i in hotelNames) {
    //                     if (ParserService.actualRequestId) {
    //                         const hotelInfo = await ParserService.getEmailFromOfficialSite(hotelNames[i])
    //
    //                         if (hotelInfo?.name) {
    //                             const { name, emails, executionTime, officialUrl} = hotelInfo
    //                             try {
    //                                 await models.HotelModel.create({ name, email: emails?.join(','), executionTime, officialUrl, country, requestId: ParserService.actualRequestId })
    //                             } catch (err) {
    //                                 console.log(err)
    //                             }
    //                         }
    //
    //                     } else {
    //                         console.log('parsing stopped')
    //                         console.log(333)
    //                         break
    //                     }
    //                 }
    //                 offset = offset + 25
    //             } else {
    //                 ParserService.actualRequestId = false
    //                 console.log('parsing stopped')
    //                 console.log(222)
    //                 console.log(ParserService.actualRequestId)
    //                 console.log(ParserService.actualRequest)
    //                 break
    //             }
    //         } catch (err) {
    //             offset = offset + 25
    //             console.log('retry')
    //             console.log(err)
    //         }
    //
    //     }
    //
    // }

    static async postHotelsByNames(page, page2, hotelNames, currentRequestId, country) {
        const hotels = [...hotelNames]

        while (hotels.length > 0 && ParserService.actualRequestId === currentRequestId) {
            try {
                if (!ParserService.hotelsInWork[currentRequestId].includes(hotels[0])) {
                    const hotelInfo = await ParserService.getEmailFromOfficialSite(page, page2, hotels[0])

                    if (hotelInfo?.name) {
                        const {name, emails, executionTime, officialUrl} = hotelInfo
                        console.log('post', country)
                        ParserService.hotelsInWork = {
                            ...ParserService.hotelsInWork,
                            [currentRequestId]: [
                                ...ParserService.hotelsInWork[currentRequestId],
                                name
                            ]
                        }
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
                }

                hotels.shift()
            } catch (err) {
                hotels.shift()
                console.log(err)
            }
        }
    }

    static async startParsingV3(currentRequestId, processesCount) {
        ParserService.processInWorkCount = { ...ParserService.processInWorkCount, [currentRequestId]: processesCount }
        ParserService.hotelsInWork = { ...ParserService.hotelsInWork, [currentRequestId]: [] }
        //process.setMaxListeners(processesCount)

        for (let i = 0; i < processesCount; i++) {
            console.log(`start process ${i + 1}`)
            ParserService.startParsingV2(currentRequestId, i, processesCount)
        }
    }

    static async startParsingV2(currentRequestId, i, processesCount) {

        const browser = await puppeteer.launch({ headless: true, devtools: true,
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox']
        })
        const pageBooking = await browser.newPage()
        const pageMaps = await browser.newPage()
        const pageOfficialSite = await browser.newPage()

        // await pageMaps.waitForNavigation({ timeout: 15000 })
        // await pageOfficialSite.waitForNavigation({ timeout: 15000 })

        await pageBooking.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36')

        await pageBooking.setJavaScriptEnabled(false)
        await pageBooking.setRequestInterception(true);
        pageBooking.on('request', request => {
            if (['image', 'font', 'stylesheet'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        })

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

        let processNumber = 0

        while (ParserService.actualRequestId === currentRequestId) {
            const offset = processNumber * 25 * processesCount + 25 * i
            try {
                const [hotelNames, country] = await ParserService.getHotels(pageBooking, ParserService.actualRequest, offset)

                if (hotelNames?.length > 0) {
                    await ParserService.postHotelsByNames(pageMaps, pageOfficialSite, hotelNames, currentRequestId, country)
                } else {
                    await browser.close()
                    break
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
        ParserService.actualRequest = false
    }

    static async getHotels(page, request, offset = 0) {
        const url = ParserService.getBookingUrl(request, offset)
        //console.log(url)
        // const browser = await puppeteer.launch({ headless: true, devtools: true,
        //     executablePath: '/usr/bin/chromium-browser',
        //     args: ['--no-sandbox']
        // })
        // const page = await browser.newPage()

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

        return [names, country]
    }

    static getBookingUrl({ place, rating, price }, offset) {
        let ratingUrl = ''
        let priceUrl = ''
        let nfltUrl = ''
        let offsetUrl = ''

        if (rating) {
            ratingUrl = rating.split(',').join(';')
        }

        if (price) {
            priceUrl = `price=EUR-${price.split(',')[0]}-${price.split(',')[1]}-1`
        }

        if (priceUrl || ratingUrl) {
            nfltUrl = `&nflt=${encodeURIComponent(priceUrl + ';' + ratingUrl)}`
        }

        if (offset) {
            offsetUrl = `&offset=${offset}`
        }

        const checking = moment().add('4', 'M').format('YYYY-MM-DD')
        const checkout = moment().add('4', 'M').add('3', 'd').format('YYYY-MM-DD')
        console.log(`https://www.booking.com/searchresults.ru.html?ss=${encodeURI(place)}${nfltUrl}&group_adults=2&no_rooms=1&group_children=0&checkin=${checking}&checkout=${checkout}&selected_currency=EUR${offsetUrl}`)
        return `https://www.booking.com/searchresults.ru.html?ss=${encodeURI(place)}${nfltUrl}&group_adults=2&no_rooms=1&group_children=0&checkin=${checking}&checkout=${checkout}&selected_currency=EUR${offsetUrl}`
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
}

module.exports = ParserService