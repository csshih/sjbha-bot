import deepmerge from 'deepmerge'
import chalk from 'chalk'
import Ducks from './Duck'
import './schema'
import './shotSchema'
import moment from 'moment'
import Analyze from './Analyze'
import Table from 'ascii-table'

const baseConfig = {
    channels: [
        "358442034790400001",
        "466328017342431233",
        "358442118928400384",
        "358527683337912320",
        "358916551744946177",
        "366820414820843522",
        "358921562658701322",
        "417871633768775693",
        "375143658128932864",
        "483859948850118678",
        "420997471741935617",
        "361192235146018826",
        "464301806533738496",
        "377347268430528522",
        "416525963464146944",
        "429459189824487463",
        "358921536071139330",
        "363123179696422916",
        "376901773656326144",
        "376901773656326144",
        "450913008323919872",
        "420136050065801227",
        "359573690033242119",
        "506911331257942027"
    ]
}

const SIX_HOURS = 1000 * 60 * 60 * 6
const EIGHTEEN_HOURS = 1000 * 60 * 60 * 12

let timeout = null

const getSecondsMinutes = (shotTime, pad=100) => {
    let time = shotTime / 1000
    time = Math.floor(time * pad) / pad

    if (time < 60) {
        return time + "s"
    }

    time = Math.floor(time / 60)
    return time + "m"
}

export default function(bastion, opt={}) {
    const config = deepmerge(baseConfig, opt)
    const q = new bastion.Queries("Duckhunt-s3")
    const qShot = new bastion.Queries("DuckhuntShot-s3")

    const analyze = Analyze(bastion)

    async function saveBang(user, userID) {
        // let player = await q.findOne({ userID })
        // if (!player) {
        //     q.create({
        //         user, userID,
        //         count: 1
        //     })
        // } else {
        //     player.count++
        //     q.update({ userID }, player)
        // }
    }

    async function sendDuck(channelID) {
        const msg = await bastion.send(channelID, "\:duck:")
        Ducks.create(channelID, msg.id)
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    

    function startTimeout() {
        console.log("**STARTING DUCKHUNT TIMIEOUT**")
        const time = getRandomInt(SIX_HOURS, EIGHTEEN_HOURS)

        if (timeout) {
            clearTimeout(timeout)
        }
        
        timeout = setTimeout(() => {
            analyze.monitor(sendDuck)
        }, time)
    }

    Ducks.onDone(duck => {
        console.log("DONE", duck)
        const time = getSecondsMinutes(duck.shotTime)
        let msg = `\:dog: *duck shot by ${duck.shotBy.user} in ${time}* `

        if (duck.misses.length) {
            const misses = duck.misses.map(n => {
                const ts = n.shotTimestamp - duck.timestamp
                return `${n.user} (${getSecondsMinutes(ts)})`
            }).join(", ")
            msg += ` \`[misses: ${misses}]\``
        }

        bastion.bot.editMessage({
            channelID: duck.channelID,
            messageID: duck.msgId,
            message: msg
        })

        startTimeout()
    })

    function formatTime(date) {
        date = new moment(date).tz("America/Los_Angeles")
        return date.fromNow() + ' [' + date.format("h:mma") + ']'
    }

    // startTimeout()

    // analyze.monitor(sendDuck)

    return [

        // {
        //     command: 'duck',

        //     resolve: async function(context, tag) {  
        //         const msg = await bastion.send(context.channelID, "\:duck:")
        //         Ducks.create(context.channelID, msg.id)
        //         // sendDuck()
        //     }
        // },

        {
            command: 'duckhunt',

            options: bastion.parsers.args(["tag"]),

            restrict: config.listRestrict,
            restrictMessage: `You can only get the duckhunt list in <#506911331257942027>`, 

            resolve: async function(context, tag) {  
                if (tag === "all") return this.route("all")
                if (tag === "speed") return this.route("speed")

                return this.route("log")

                const user = await q.findOne({ userID: context.userID })
                if (!user) return `You haven't shot any ducks, keep looking!`

                return `Count: **${user.count}**`
            }
        },

        // {
        //     command: 'fix',

        //     resolve: async function() {
        //         const hits = await q.getAll()
        //         const shots = await qShot.getAll()
        //         console.log(shots)
        //         const removeMiss = {}
        //         for (var i = 0; i < shots.length; i++) {
        //             const shotBy = shots[i].shotBy.userID
        //             const misses = shots[i].misses

        //             const dupeMiss = misses.find( n => n.userID === shotBy)
        //             if (dupeMiss) {
        //                 console.log("OFFENDER", shots[i].shotBy.user)

        //                 if (!removeMiss[shotBy]) {
        //                     removeMiss[shotBy] = 1
        //                 } else {
        //                     removeMiss[shotBy]++
        //                 }
        //             }
        //         }
        //         console.log(removeMiss)
        //         return "Sup?"
        //     }
        // },

        {
            action: 'duckhunt:all',

            resolve: async function(context, tag) {  
                const counter = function(val) {
                    if (val < 10) return ' ' + val
                    else return val
                }

                const padScore = val => {
                    if (val < 10) return '  ' + val
                    if (val < 100) return ' ' + val
                    return val
                }

                const shots = await qShot.getAll()
                const players = await q.getAll()
                const playerScores = players.map(n => {
                    n.score = n.count*10 + n.misses*5
                    n.total = n.count + n.misses
                    return n
                })
                console.log(playerScores)
                const msg = playerScores
                    .sort( (a, b) => {
                        if (a.total > b.total) return -1
                        if (a.total < b.total) return 1
                        if (a.misses < b.misses) return -1
                        if (a.misses > b.misses) return 1
                        return 0
                    }).map( p => {
                        return `${padScore(p.total)} [${counter(p.count)}-${p.misses}] ${p.user}`
                    }).join("\n")
                return bastion.helpers.code(`# Season 3 Results\nDucks Spawned: ${shots.length}\n\n${msg}`, "ini")
            }
        },

        {
            action: 'duckhunt:speed',

            resolve: async function(context, tag) {  
                const shots = await qShot.getAll()
                const users = {}

                const addScore = (user, time) => {
                    if (!users.hasOwnProperty(user)) {
                        users[user] = []
                    }
                    users[user].push(time)
                }

                // Get all shot speeds
                for (var i = 0; i < shots.length; i++) {
                    const shot = shots[i]
                    if (!shot.spawnTimestamp) continue;

                    addScore(shot.shotBy.user, shot.shotBy.shotTimestamp - shot.spawnTimestamp)
                    for (var k = 0; k < shot.misses.length; k++) {
                        addScore(shot.misses[k].user, shot.misses[k].shotTimestamp - shot.spawnTimestamp)
                    }
                }

                const speederboard = new Table()
                // PIck best one for each user
                Object.keys(users)
                    .map( n => {
                        const score = users[n].reduce( (l, r) => l < r ? l : r, Number.MAX_VALUE)
                        return {
                            user: n,
                            score: score
                        }
                    })
                    .sort( (a, b) => a.score < b.score ? -1 : 1)
                    .forEach( (entry, i) => {
                        const rank = (i + 1).toString()
                        const time = getSecondsMinutes(entry.score)
                        speederboard.addRow(
                            rank + '.',
                            entry.user,
                            time
                        )
                    })

                speederboard.removeBorder()

                const msg = ''
                return bastion.helpers.code(`# Season 3 Results\nSpeederboard\n\n${speederboard.toString()}`, "ini")
            }
        },

        {
            action: 'duckhunt:log',

            resolve: async function(context, tag) {  
                const shots = await qShot.Schema
                    .find()
                    .sort('-timestamp')
                    .limit(5)
                    .exec()

                console.log(shots)

                let msg = shots.map( n => {
                    let seconds = ""
                    if (n.spawnTimestamp) {
                        const ts = n.timestamp - n.spawnTimestamp
                        seconds = ` (${getSecondsMinutes(ts)})`
                    }
                    let msg = `${formatTime(n.timestamp)} 🔫 ${n.shotBy.user}${seconds} in <#${n.channelID}>`
                    if (n.misses.length) {
                        const misses = n.misses.map( m => {
                            let seconds = ""
                            if (n.spawnTimestamp && m.shotTimestamp) {
                                const ts = m.shotTimestamp - n.spawnTimestamp
                                seconds = ` (${getSecondsMinutes(ts)})`
                            }
                            return `${m.user}${seconds}`
                        }).join(", ")
                        msg += `\n  > ${misses}`
                    }
                    return msg
                }).join("\n\n")

                msg = bastion.bot.fixMessage(msg)

                return bastion.helpers.code('# Season 3 Results\n\n' + msg, 'ini')
            }
        },

        // {
        //     command: "bang",

        //     resolve: async function(context, tag) {
        //         const msg_id = context.evt.d.id

        //         await bastion.bot.deleteMessage({
        //             channelID: context.channelID,
        //             messageID: msg_id
        //         })

        //         const duck = Ducks.bang(bastion, context.channelID, context.userID, context.user)
        //         if (!duck) return;

        //         let msg = `🦆💥${duck.misses.map(n => `💥`)}`

        //         await bastion.bot.editMessage({
        //             channelID: context.channelID,
        //             messageID: duck.msgId,
        //             message: msg
        //         })

        //         if (duck.newShot) {
        //             saveBang(context.user, context.userID)
        //         }
        //     },

        //     methods: {
        //         getSecondsMinutes(shotTime) {
        //             let time = shotTime / 1000
        //             time = Math.floor(time * 1000) / 1000
    
        //             if (time < 60) {
        //                 return time + "s"
        //             }

        //             time = Math.floor(time / 60)
        //             return time + "m"
        //         }
        //     }
        // }

    ]
}