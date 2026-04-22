class ApiResponse {
  static success(data, message = 'OK') {
    return { success: true, message, data };
  }

  static error(message, code, stack, details) {
    return { success: false, message, code, details, stack };
  }

  static paginated(data, total, page, limit) {
    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = ApiResponse;
