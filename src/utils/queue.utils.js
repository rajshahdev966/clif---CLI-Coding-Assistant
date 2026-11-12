
let queueTail = Promise.resolve()

export default function enqueueMutation(operation){

    const operationPromise = queueTail.then(operation)

    queueTail = operationPromise.catch(()=> {})

    return operationPromise;

}