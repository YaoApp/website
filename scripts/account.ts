import { Exception, PagedData, Process } from "@yao/runtime";

/**
 * After search hook: filter password fields
 * @param data
 */
function AfterSearch(res: PagedData): PagedData {
  res.data.forEach(secureFilter);
  return res;
}

/**
 * After find hook: filter password fields
 * @param item
 * @returns
 */
function AfterFind(item: Record<string, any>): Record<string, any> {
  secureFilter(item);
  return item;
}

/**
 * Remove password fields from the item
 * @param item the item to filter
 */
function secureFilter(item: Record<string, any>) {
  item.password = null;
  item.password2nd = null;
}

/**
 * Custom save process
 * @param formdata
 * @returns
 */
function Save(formdata: Record<string, any>): number | string {
  // Change password
  if (formdata.new_password) {
    if (!formdata.id) {
      throw new Exception("Admin user ID is required", 400);
    }

    // Check if confirm password is set
    if (formdata.new_password !== formdata.new_password_confirm) {
      throw new Exception(
        "New password and confirm password do not match",
        400
      );
    }

    // Validate the old password
    validatePassword(formdata.id, formdata.password, formdata.new_password);

    // Update the password
    formdata.password = formdata.new_password;
    return Process("models.admin.user.Save", formdata);
  }

  // Format the mobile and email
  formdata.mobile = formdata.mobile || null;
  formdata.email = formdata.email || null;

  // Add new user
  if (!formdata.id) {
    if (!formdata.password) {
      throw new Exception("Password is required", 400);
    }

    // Mobile or email is required
    if (!formdata.mobile && !formdata.email) {
      throw new Exception("Mobile or email is required", 400);
    }

    return Process("models.admin.user.Save", formdata);
  }

  // Update user
  // Save the data without password (update)
  delete formdata.password; // Remove password field
  return Process("models.admin.user.Save", formdata);
}

function validatePassword(
  id: string | number,
  password: string,
  newPassword: string
) {
  if (password === newPassword) {
    throw new Exception(
      "New password cannot be the same as the old password",
      400
    );
  }

  // Get old password hash
  const user = Process("models.admin.user.Find", id, { select: ["password"] });

  // Validate the password
  try {
    Process("utils.pwd.Verify", password, user.password);
  } catch (e) {
    // Custom error message
    throw new Exception("Invalid password", 400);
  }
}
