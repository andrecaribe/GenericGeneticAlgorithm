/*jslint forin: true, plusplus: true, todo: true */
var GenericAlgorithmGenetic = function() {

    "use strict";

    var population = [],
        breeders = [],

        options = {
            // time limit in milliseconds
            timeLimit: 3000,

            // number of iterations to create new generations
            generationsLimit: 100,

            // percentual of best case and worst case in population
            goalLimit: undefined,

            // number of more iterations after hit the goal
            generationsLimitAfterGoal: 25,

            // number of total individuals on each iteration
            populationSize: 100,

            // number of max individuals on each iteration after crossover
            populationMaxSize: 200,

            // TODO: implement
            // percentual of population it die on each iteration
            mortalityRate: 0.2,

            // method to select individuals
            selectionMethod: 'stochasticUniversalSampling',

            // method to define how the changes in allele chromosomes occurs
            crossoverMethod: 'single',

            // TODO: implement
            // chance to occur crossover 
            crossoverFactor: 1.0,

            // method to define how the mutation occurs
            mutationMethod: 'randomMutation',

            // chance to occur mutation
            mutationFactor: 0.05,

            // problem type
            better: 'maximization',

            // is possible to repeat values of genes in same chromosome?
            canRepeatGenes: true,

            // specification of chromosome
            chromosome: null,

            // specification of fitness method
            fitness: null
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// MATH /////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         *  Generate a random Number.
         *
         *  @param Number, minimum value
         *  @param Number, maximum value
         *  @param int
         *
         *  @return Number
         */
        randomRangeNumber = function(minVal, maxVal, floatVal) {
            var randVal = minVal + (Math.random() * (maxVal - minVal));
            return floatVal === undefined ? Math.round(randVal) : randVal.toFixed(floatVal);
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// FITNESS ALGORITHMS ///////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         *  Calculate fitness to each individual.
         */
        calculateFitness = function() {
            var i;

            if (options.fitness === null) {
                throw 'Error: fitness method should be defined. You should create an function to calculate fitness.';
            }

            for (i = 0; i < population.length; i++) {
                options.fitness(population[i]);
            }
        },

        /**
         *  Sort population array
         */
        sortPopulationByFitness = function() {
            population.sort(function(a, b) {
                return a.fitness - b.fitness;
            });

            if (options.better === 'minimization') {
                population.reverse();
            }
        },

        /**
         * Weak individuals die
         * 
         * @param int
         *
         * TODO: change name of this method
         */
        naturalSelection = function(cutoff) {
            population.splice(0, cutoff);
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// SELECTION ALGORITHMS /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         * Stochastic Universal Sampling
         */
        stochasticUniversalSampling = function() {
            var selectionSize = (options.populationMaxSize - options.populationSize),
                totalFitness = 0,
                startOffset = Math.random(),
                cumulativeExpectation = 0,
                index = 0,
                i,
                getAdjustedFitness = function(rawFitness, isNaturalFitness)  {
                    if (isNaturalFitness) {
                        return rawFitness;
                    } else {
                        return isNaN(rawFitness) === true ? Number.POSITIVE_INFINITY : 1 / rawFitness;
                    }
                };

            for (i = population.length - 1; i >= 0; i--) {
                totalFitness += getAdjustedFitness(population[i].fitness, false);
            }

            for (i = population.length-1; i >= 0 ; i--) {
                cumulativeExpectation += getAdjustedFitness(population[i].fitness, false) / totalFitness * selectionSize;
                while (cumulativeExpectation > startOffset + index) {
                    breeders.push(population[i]);
                    index++;
                }
            }
        },

        fitnessScaling = function() {
            // TODO: implement fitness scaling algorithm
            throw "Error: fitnessScaling is not implemented yet.";
        },

        fitnessWindowing = function() {
            // TODO: implement fitness windowing algorithm
            throw "Error: fitnessWindowing is not implemented yet.";
        },

        fitnessRanking = function() {
            // TODO: implement fitness ranking algorithm
            throw "Error: fitnessRanking is not implemented yet.";
        },

        tournamentSelection = function() {
            // TODO: implement tournament selection algorithm
            throw "Error: tournamentSelection is not implemented yet.";
        },

        probabilisticTournamentSelection = function() {
            // TODO: implement probabilistic tournament selection algorithm
            throw "Error: probabilisticTournamentSelection is not implemented yet.";
        },

        hawkDoveRoulette = function() {
            // TODO: implement hawk dove roulette (HDR) algorithm
            throw "Error: hawkDoveRoulette is not implemented yet.";
        },

        hawkDoveTournament = function() {
            // TODO: implement hawk dove tournament (HDT) algorithm
            throw "Error: hawkDoveTournament is not implemented yet.";
        },

        /**
         * ...
         */
        selectBreeders = function() {

            breeders = [];
            
            switch (options.selectionMethod) {

            case 'stochasticUniversalSampling':
                stochasticUniversalSampling();
                break;

            case 'fitnessScaling':
                fitnessScaling();
                break;

            case 'fitnessWindowing':
                fitnessWindowing();
                break;

            case 'fitnessRanking':
                fitnessRanking();
                break;

            case 'tournamentSelection':
                tournamentSelection();
                break;

            case 'probabilisticTournamentSelection':
                probabilisticTournamentSelection();
                break;

            default:
                throw "Error: selection method not exists!";

            }
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// CROSSOVER ALGORITHMS /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         * ...
         */
        crossoverSingle = function(individuals) {
            
            var crossPoint = Math.floor(Math.random() * options.chromosome.length),
                childrens = [{fitness: NaN, chromosome: []}, {fitness: NaN, chromosome: []}],
                index;

            if (options.canRepeatGenes === true) {

                for (index = 0; index < options.chromosome.length; index++) {
                    if (index <= crossPoint) {
                        childrens[0].chromosome.push({gene: individuals[0].chromosome[index].gene, value: individuals[0].chromosome[index].value});
                        childrens[1].chromosome.push({gene: individuals[1].chromosome[index].gene, value: individuals[1].chromosome[index].value});
                    } else {
                        childrens[0].chromosome.push({gene: individuals[1].chromosome[index].gene, value: individuals[1].chromosome[index].value});
                        childrens[1].chromosome.push({gene: individuals[0].chromosome[index].gene, value: individuals[0].chromosome[index].value});
                    }
                }
            } else {
                var noSelectedGenForChild1 = individuals[0].chromosome.slice(),
                    noSelectedGenForChild2 = individuals[1].chromosome.slice(),
                    randomIndex;

                for (index = 0; index < options.chromosome.length; index++) {

                    if (index <= crossPoint) {
                        childrens[0].chromosome.push({gene: noSelectedGenForChild1[0].gene, value: noSelectedGenForChild1[0].value});
                        noSelectedGenForChild1.splice(0, 1);

                        childrens[1].chromosome.push({gene: noSelectedGenForChild2[0].gene, value: noSelectedGenForChild2[0].value});
                        noSelectedGenForChild2.splice(0, 1);
                    } else {
                        // Child 1:
                        randomIndex = Math.floor(Math.random() * noSelectedGenForChild1.length);
                        childrens[0].chromosome.push({gene: noSelectedGenForChild1[randomIndex].gene, value: noSelectedGenForChild1[randomIndex].value});
                        noSelectedGenForChild1.splice(randomIndex, 1);

                        // Child 2:
                        randomIndex = Math.floor(Math.random() * noSelectedGenForChild2.length);
                        childrens[1].chromosome.push({gene: noSelectedGenForChild2[randomIndex].gene, value: noSelectedGenForChild2[randomIndex].value});
                        noSelectedGenForChild2.splice(randomIndex, 1);
                    }
                }
                
            }

            individuals.push(childrens[0], childrens[1]);
        },

        /**
         * ...
         */
        crossoverDouble = function (individuals) {
            // TODO: implement crossover double algorithm
            throw "Error: crossoverDouble is not implemented yet.";
        },

        /**
         * ...
         */
        crossoverMerge = function (individuals) {
            // TODO: implement crossover merge algorithm
            throw "Error: crossoverMerge is not implemented yet.";
        },

        /**
         * ...
         */
        crossbreed = function(parent) {
            var individuals = [parent.dad, parent.mom];

            switch (options.crossoverMethod) {

            case 'single':
                crossoverSingle(individuals);
                break;

            case 'double':
                crossoverDouble();
                break;

            case 'merge':
                crossoverMerge();
                break;

            default:
                throw "Error: crossover method not exists!";

            }
            return individuals;
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// MUTATIONS ALGORITHMS /////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         * ...
         */
        randomMutation = function (individual) {
            var i,
                index,
                geneValue;

            for (i = 0; i < options.chromosome.length; i++) {
                if (Math.random() <= options.mutationFactor) {
                    if (options.canRepeatGenes === true) {
                        geneValue = randomRangeNumber(options.chromosome[i].minValue, options.chromosome[i].maxValue, 0);
                        individual.chromosome[i].geneValue = geneValue;
                    } else {
                        geneValue = individual.chromosome.splice(i, 1);
                        index = Math.floor(Math.random() * individual.chromosome.length);
                        individual.chromosome.splice(index, 0, geneValue[0]);
                    }
                }
            }
        },

        /**
         * ...
         */
        selectMutation = function(individual) {
            switch (options.mutationMethod) {

            case 'randomMutation':
                randomMutation(individual);
                break;

            case 'none':
                break;

            default:
                throw "Error: mutation method not exists!";

            }
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// REPRODUCTIONS ALGORITHMS /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         *  Creates an individual with random characteristics.
         *
         *  @return Object
         */
        createIndividual = function() {
            var geneValue = 0,
                chain = [],
                i;

            if (options.chromosome === null || options.chromosome.length === 0) {
                throw 'Error: chromosome should be defined.';
            }

            if (options.canRepeatGenes === true) {

                for (i = 0; i < options.chromosome.length; i++) {
                    geneValue = randomRangeNumber(options.chromosome[i].minValue, options.chromosome[i].maxValue, 0);
                    chain.push({gene: options.chromosome[i].gene, value: geneValue});
                }

            } else {
                var genes = options.chromosome.slice(),
                    geneIndex;

                while (genes.length > 0) {
                    geneIndex = Math.floor(Math.random() * genes.length);
                    chain.push({gene: genes[geneIndex].gene, value: genes[geneIndex].value});
                    genes.splice(geneIndex, 1);
                }
            }


            return {fitness: NaN, chromosome: chain};
        },

        /**
         *  Creates a new population.
         */
        initializePopulation = function(onComplete) {
            var i;

            for (i = 0; i < options.populationSize; i++) {
                population.push(createIndividual());
            }

            if (onComplete !== undefined) {
                onComplete(population);
            }
        },

    ////////////////////////////////////////////////////////////////////////////
    ///// GENERATION ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         * ...
         */
        generation = function(onComplete) {
            var crossbreedResult = [],
                message = 'Generation complete with success.',
                startTime = (new Date()).getTime(),
                timeElapsed,
                limit,
                goalLimitActivate = false;

            // Generation
            for (limit = 0; limit < options.generationsLimit; limit++) {

                selectBreeders();
                
                // Crossover
                for (var i = breeders.length - 1; i >= 0; i-=2) {
                    crossbreedResult = crossbreed({dad:breeders[i], mom:breeders[i-1]});

                    selectMutation(crossbreedResult[2]);
                    selectMutation(crossbreedResult[3]);

                    population.push(crossbreedResult[2], crossbreedResult[3]);
                }

                // Ordering results
                calculateFitness();
                sortPopulationByFitness();

                // Cutoff
                naturalSelection(population.length - options.populationSize);

                // Time limit
                timeElapsed = ((new Date()).getTime() - startTime);
                if (timeElapsed >= options.timeLimit) {
                    message = 'Generation stop by time limit after iteration' + limit + '.';
                    break;
                }

                // Goal limit
                if( options.goalLimit !== undefined && goalLimitActivate === false && options.goalLimit <= (population[options.populationSize-1].fitness / population[0].fitness)) {
                    goalLimitActivate = true;
                    message = 'Generation stop by goal limit after iteration ' + limit + ' and iterates more ' + options.generationsLimitAfterGoal + ' times.';
                    limit = options.generationsLimit - options.generationsLimitAfterGoal;
                }
            }

            // Callback
            if (onComplete !== undefined) {
                onComplete(population, {message: message, time: timeElapsed + "ms"});
            }
        };

    return {

    ////////////////////////////////////////////////////////////////////////////
    ///// PUBLIC METHODS ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

        /**
         * ...
         */
        init: function(settings) {
            var s;

            for (s in settings) {
                if (options.hasOwnProperty(s)) {
                    options[s] = settings[s];
                }
            }
        },

        /**
         * ...
         */
        initialize: function(onComplete) {
            initializePopulation(onComplete);
            calculateFitness();
            sortPopulationByFitness();
        },

        /**
         * ...
         */
        generate: function(onComplete) {
            generation(onComplete);
        },

        /**
         * ...
         */
        kill: function(individuals, onComplete) {
            // TODO: remove some individuals from population
        }

    };
};