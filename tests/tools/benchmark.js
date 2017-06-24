const benchmarks = new Map();



function starting(label){
   const now = Date.now();
   benchmarks.set(label, { started_at: now });
}



function finishing(label){
   const now = Date.now();
   benchmarks.get(label).finished_at = now;
}



function getDurationOf(label){
   const benchmark = benchmarks.get(label);

   if(!benchmark.started_at)
      throw new Error('This benchmark hasn\'t been started');

   if(!benchmark.finished_at)
      throw new Error('This benchmark hasn\'t finished yet');

   return benchmark.finished_at - benchmark.started_at;
}



module.exports = { starting, finishing, getDurationOf };
