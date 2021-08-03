import Alpine from '/node_modules/alpinejs/dist/module.esm.js'

/**
 * Helper function to determine wether two arrays include any of the same items.
 * @param  {Array} a
 * @param  {Array} b
 * @return {Boolean}
 */
function includesAnyLeader(a, b) {
  return a.some(item => b.includes(item))
}

/**
 * Convert human-written strings of teams (comma-seperated names) to a trimmed array of names.
 * @param  {String} value List of names in human-readable format.
 * @return {Array}
 */
function leaderStringToArray(value) {
  if (value.length === 0) {
    return null
  }
  const strings = value.split(',')
  return strings.map(leader => leader.trim())
}

/**
 * Swaps two pairs of the solution. Won't swap a pre-filled / fixed pair. Will take a pair from the
 * array of free pairs to fill gaps.
 * @param  {Number} a Index of pair.
 * @param  {Number} b Index of pair.
 * @return {void}
 */
function swap (solution, free, a, b) {
  let pairA = solution[a]
  if (pairA === null) {
    pairA = free.splice(0, 1)[0]
  }
  let pairB = solution[b]
  if (pairB === null) {
    pairB = free.splice(0, 1)[0]
  }
  solution[a] = pairB
  solution[b] = pairA
}

Alpine.data('matcher', function () {
  return {
    days: [{ program: '', leaders: '' }, { program: '', leaders: '' }, { program: '', leaders: '' }],
    free: [], // e.g. [['Anna', 'Till'], ['Miri', 'Jamie']]
    get freeDays () {
      return this.days.filter(day => day.leaders.trim().length < 1).length
    },
    solution: [],
    options: {
      pause: 2,
    },

    /**
     * Determines wether a given solution actually meets the requirements.
     * @param  {Array}  days    The days with optionally pre-filled (fixed) teams.
     * @param  {Array}  free    The available teams to be filled.
     * @param  {Object} options Some options to tweak the solution.
     * @return {Boolean}
     */
    isOkay: function (days, free, options) {
      return !days.some((today, index) => {
        const config = {
          pause: 2,
          ...options,
        }
        if (today === null) {
          return true
        }
        const todayMinusThree = days[(days.length + index - 3) % days.length] ?? []
        const todayMinusTwo = days[(days.length + index - 2) % days.length] ?? []
        const todayMinusOne = days[(days.length + index - 1) % days.length] ?? []
        const todayPlusOne = days[(days.length + index + 1) % days.length] ?? []
        const todayPlusTwo = days[(days.length + index + 2) % days.length] ?? []
        const todayPlusThree = days[(days.length + index + 3) % days.length] ?? []
        return (
          (config.pause >= 3 && includesAnyLeader(todayMinusThree, today)) ||
          (config.pause >= 2 && includesAnyLeader(todayMinusTwo, today)) ||
          (config.pause >= 1 && includesAnyLeader(todayMinusOne, today)) ||
          (config.pause >= 1 && includesAnyLeader(todayPlusOne, today)) ||
          (config.pause >= 2 && includesAnyLeader(todayPlusTwo, today)) ||
          (config.pause >= 3 && includesAnyLeader(todayPlusThree, today))
        )
      })
    },

    /**
     * Will attempt to solve the given problem by randomly swapping pairs and filling gaps until isOkay()
     * returns true.
     * @return {void}
     */
    solve: function () {
      const days = this.days.map(day => leaderStringToArray(day.leaders))
      let solution = [...days]
      let free = this.free.map(pair => leaderStringToArray(pair))
      let counter = 0
      do {
        counter += 1

        const randomDayA = Math.floor(Math.random() * days.length) + 0
        const randomDayB = Math.floor(Math.random() * days.length) + 0
        if (randomDayA === randomDayB) {
          continue
        }
        if (days[randomDayA] !== null || days[randomDayB] !== null) {
          continue // either day has a fixed team
        }

        // Randomly swap pairs
        let pairA = solution[randomDayA]
        if (pairA === null) {
          pairA = free.splice(0, 1)[0]
        }
        let pairB = solution[randomDayB]
        if (pairB === null) {
          pairB = free.splice(0, 1)[0]
        }
        solution[randomDayA] = pairB
        solution[randomDayB] = pairA
      } while(!(this.isOkay(solution, free, this.options) && free.length === 0 || counter > 100))
      this.solution = solution
    },
  }
})

Alpine.start()