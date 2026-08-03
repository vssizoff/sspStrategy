import gen from "random-seed";

const rand = process.env.RANDOM_SEED ? gen.create(process.env.RANDOM_SEED) : gen.create();

export default rand;
