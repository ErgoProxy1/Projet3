
export function pointsOnPath(path: string) {
    let points = []
    let commands = path.match(/[a-z][^a-z]*/ig);
    for(let c of commands){
        let coords = c.replace(/[LMC]/, '').split(" ");
        points.push(coords);
    }
    points = points.filter((coord,pos,self)=>self.findIndex(c_comp=>(c_comp[0] === coord[0] && c_comp[1]===coord[1]))===pos)
    //points = points.filter((e, i) => i % 2 === 0)
    return points
}