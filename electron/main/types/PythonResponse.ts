interface PythonResponse<T = any> {
  error: number
  message: string
  data: T
}

export default PythonResponse
